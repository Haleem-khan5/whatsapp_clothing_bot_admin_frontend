import { useEffect, useMemo, useState } from 'react';
import { useImageJobs } from '@/hooks/useImageJobs';
import { useStores } from '@/hooks/useStores';
import { useCommonThings, useUpdateExchangeRate } from '@/hooks/useCommonThings';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search } from 'lucide-react';

// Default USD → EGP rate used when backend/common_things is not yet set.
// Actual source of truth is common_things.exchange_usd_egp, editable from this page.
const DEFAULT_USD_TO_EGP = 48.5;

export default function ImageJobs() {
  const [filters, setFilters] = useState({ page: 1, page_size: 20 });
  const [storeId, setStoreId] = useState<string | undefined>(undefined);
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [range, setRange] = useState<'this_week' | 'this_month' | 'all'>('this_week');

  const { data, isLoading } = useImageJobs({ ...filters, store_id: storeId, from, to });
  const { data: storesResp } = useStores();
  const { data: commonResp } = useCommonThings();
  const updateExchangeRate = useUpdateExchangeRate();
  const { toast } = useToast();

  const currentExchangeRate =
    typeof commonResp?.data?.exchange_usd_egp === 'number'
      ? commonResp.data.exchange_usd_egp
      : DEFAULT_USD_TO_EGP;

  const lastUpdatedAt = commonResp?.data?.updated_at;
  const lastUpdatedByName = commonResp?.data?.updated_by_name || commonResp?.data?.updated_by_email;

  const [exchangeInput, setExchangeInput] = useState<string>('');

  // Keep local input in sync with backend value
  useEffect(() => {
    if (typeof currentExchangeRate === 'number' && !Number.isNaN(currentExchangeRate)) {
      setExchangeInput(String(currentExchangeRate));
    }
  }, [currentExchangeRate]);

  // Store metadata lookup: name, credits/job, resolution, etc.
  const storeMeta = useMemo(() => {
    const stores: any[] = storesResp?.data || [];
    const m = new Map<
      string,
      {
        name: string;
        creditsPerJob?: number;
        outputResolution?: string;
      }
    >();
    for (const s of stores) {
      const creditsPerJob =
        s.per_image_credit != null
          ? Number(s.per_image_credit)
          : s.credits_per_dress != null
            ? Number(s.credits_per_dress)
            : undefined;

      m.set(s.store_id, {
        name: s.store_name,
        creditsPerJob,
        outputResolution: s.output_resolution,
      });
    }
    return m;
  }, [storesResp]);

  const rows = useMemo(() => {
    const list = data?.data || [];
    return list.map((j: any, idx: number) => {
      const meta = storeMeta.get(j.store_id);
      const storeName = meta?.name || j.store_id;

      // Package label (used for pricing logic + badge)
      const rawPkgLabel = j.package || j.package_name || (j.ready_for_publish ? 'Elite' : 'Pro');
      const pkgLabel = String(rawPkgLabel || 'Pro').trim();
      const pkgLabelLower = pkgLabel.toLowerCase();

      // Credits / Job – primary source is store dashboard (per_image_credit / credits_per_dress)
      const creditsPerJob =
        meta?.creditsPerJob ??
        (typeof j.credits_per_job === 'number' ? j.credits_per_job : undefined) ??
        0;

      // USD/EGP – per-job rate from DB when present (historical), else current global FX.
      const usdToEgp =
        typeof j.usd_to_egp === 'number' && !Number.isNaN(j.usd_to_egp) && j.usd_to_egp > 0
          ? j.usd_to_egp
          : currentExchangeRate || DEFAULT_USD_TO_EGP;

      // Image resolution from store (used for Elite pricing tiers)
      const resolution = String(meta?.outputResolution || '').toUpperCase();

      // Gemini cost (USD) based on package + resolution
      let geminiCostUsd = 0;
      if (pkgLabelLower.includes('basic')) {
        geminiCostUsd = 0.08;
      } else if (pkgLabelLower.includes('pro')) {
        const noBg =
          pkgLabelLower.includes('without background') ||
          pkgLabelLower.includes('without bg') ||
          pkgLabelLower.includes('no background');
        const withBg =
          pkgLabelLower.includes('with background') || pkgLabelLower.includes('with bg');

        if (noBg) {
          geminiCostUsd = 0.12;
        } else if (withBg) {
          geminiCostUsd = 0.14;
        } else {
          // Fallback: treat generic "Pro" as with background
          geminiCostUsd = 0.14;
        }
      } else if (pkgLabelLower.includes('elite')) {
        if (resolution === '2K' || resolution === '4K') {
          geminiCostUsd = 0.75;
        } else {
          // Default Elite tier (1K normal)
          geminiCostUsd = 0.26;
        }
      }

      const costComputed = geminiCostUsd * usdToEgp;
      const profitComputed = creditsPerJob - costComputed;

      return {
        ...j,
        st_no: idx + 1,
        display_job_id: j.friendly_job_id || j.job_id,
        store_name: storeName,
        status: j.error_code || '',
        _pkgLabel: pkgLabel,
        _creditsPerJob: creditsPerJob,
        _geminiCostUsd: geminiCostUsd,
        _usdToEgp: usdToEgp,
        _costComputed: costComputed,
        _profitComputed: profitComputed,
      };
    });
  }, [data?.data, storeMeta, currentExchangeRate]);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((row: any) => {
      const storeVal = String(row.store_name ?? '').toLowerCase();
      const jobVal = String(row.display_job_id ?? '').toLowerCase();
      return storeVal.includes(q) || jobVal.includes(q);
    });
  }, [rows, searchQuery]);

  // Always fetch and show all matching image jobs (no paginated slices on this page)
  useEffect(() => {
    const total = data?.meta?.total || 0;
    if (total > 0 && filters.page_size !== total) {
      setFilters((prev) => ({ ...prev, page: 1, page_size: total }));
    }
  }, [data?.meta?.total, filters.page_size]);

  const formatErrorCode = (code?: string): string => {
    if (!code) return '';
    const upper = String(code).toUpperCase();
    switch (upper) {
      case 'INSUFFICIENT_QUOTA':
      case 'QUOTA':
        return 'Insufficient Quota';
      case 'DOWNLOAD_ERROR':
        return 'Download Error';
      case 'FRONT_POSE_ERROR':
        return 'Front Pose Error';
      case 'DIFF_POSE_ERROR':
        return 'Different Pose Error';
      default:
        return upper
          .toLowerCase()
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
    }
  };

  const handleExport = () => {
    const rowsForExport = filteredRows;
    if (!rowsForExport.length) {
      alert('No image jobs to export for the current filters.');
      return;
    }

    // Define CSV columns (aligning with table + a few useful extras)
    const headers = [
      'St #',
      'Job ID',
      'Store',
      'Package',
      'Processing Time (s)',
      'Credits / Job',
      'Gemini Cost (USD)',
      'USD/EGP',
      'Cost (EGP)',
      'Profit (EGP)',
      'Error Code',
      'Timestamp',
      // Image links (as shown in the table)
      'Original Image URL',
      'Raw Pose1 URL',
      'Front Pose URL',
      'Diff Pose URL',
      'Third Pose URL',
    ];

    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return '';
      const s = String(val);
      if (/[",\n]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines: string[] = [];
    lines.push(headers.map(escapeCsv).join(','));

    for (const row of rowsForExport as any[]) {
      const ts = row.timestamp ? new Date(row.timestamp) : null;
      const tsStr =
        ts && !isNaN(ts.getTime())
          ? ts.toLocaleString('en-US', {
              year: '2-digit',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';

      const r = [
        row.st_no,
        row.display_job_id || row.job_id || '',
        row.store_name || '',
        row._pkgLabel || row.package || row.package_name || '',
        row.processing_time_sec != null ? Math.round(Number(row.processing_time_sec)) : '',
        row._creditsPerJob != null ? Number(row._creditsPerJob).toFixed(2) : '',
        row._geminiCostUsd != null ? Number(row._geminiCostUsd).toFixed(4) : '',
        row._usdToEgp != null ? Number(row._usdToEgp).toFixed(4) : '',
        row._costComputed != null ? Number(row._costComputed).toFixed(2) : '',
        row._profitComputed != null ? Number(row._profitComputed).toFixed(2) : '',
        row.error_code || '',
        tsStr,
        // Image URLs
        row.original_file_url || '',
        row.raw_pose1_url || '',
        row.front_pose_url || '',
        row.diff_pose_url || '',
        row.third_pose_url || '',
      ];

      lines.push(r.map(escapeCsv).join(','));
    }

    const csv = lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const storePart = storeId ? `store-${storeId}` : 'all-stores';
    const fromPart = from || 'start';
    const toPart = to || 'now';
    a.download = `image-jobs-${storePart}-${fromPart}-to-${toPart}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Totals row (based on all visible rows for current filters) ---
  const totals = useMemo(() => {
    const credits = filteredRows.reduce(
      (acc: number, r: any) => acc + (Number(r._creditsPerJob) || 0),
      0
    );
    const geminiUsd = filteredRows.reduce(
      (acc: number, r: any) => acc + (Number(r._geminiCostUsd) || 0),
      0
    );
    const cost = filteredRows.reduce(
      (acc: number, r: any) => acc + (Number(r._costComputed) || 0),
      0
    );
    const profit = filteredRows.reduce(
      (acc: number, r: any) => acc + (Number(r._profitComputed) || 0),
      0
    );
    return {
      credits,
      geminiUsd: Number.isFinite(geminiUsd) ? geminiUsd : 0,
      cost: Number.isFinite(cost) ? cost : 0,
      profit: Number.isFinite(profit) ? profit : 0,
    };
  }, [filteredRows]);

  const Thumb = ({ url }: { url?: string }) => {
    if (!url) {
      return <div className="h-10 w-10 rounded-md border border-slate-200 bg-slate-50" />;
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={url}
          alt=""
          className="h-10 w-10 rounded-md object-cover border border-slate-200 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
          loading="lazy"
        />
      </a>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (

      <div className="">
        {/* Heading + global FX control (side-by-side) */}
        <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Image Jobs Processed</h1>

          {/* Global USD/EGP control (shared across all admins) */}
          <div className="flex flex-col items-start gap-0.5 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-700">USD/EGP:</span>
              <input
                type="number"
                step="0.01"
                value={exchangeInput}
                onChange={(e) => setExchangeInput(e.target.value)}
                className="h-9 w-24 rounded-md border border-slate-300 bg-white px-2 text-sm shadow-[inset_0_1px_0_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <Button
                type="button"
                size="sm"
                className="h-8 px-3 rounded-md bg-slate-800 hover:bg-slate-900 text-white text-xs"
                onClick={() => {
                  const parsed = parseFloat(exchangeInput);
                  if (!Number.isFinite(parsed) || parsed <= 0) {
                    // Simple inline guard; you can replace with toast if desired.
                    toast({
                      title: 'Invalid value',
                      description: 'Please enter a positive number for USD/EGP.',
                      variant: 'destructive',
                    });
                    return;
                  }
                  updateExchangeRate.mutate(parsed, {
                    onSuccess: () => {
                      toast({
                        title: 'Exchange rate updated',
                        description: `USD/EGP is now set to ${parsed.toFixed(2)}.`,
                      });
                    },
                    onError: (err: any) => {
                      const msg =
                        err?.response?.data?.message ||
                        err?.response?.data?.error ||
                        'Could not update exchange rate.';
                      toast({
                        title: 'Update failed',
                        description: msg,
                        variant: 'destructive',
                      });
                    },
                  });
                }}
                disabled={updateExchangeRate.isPending}
              >
                Save FX
              </Button>
            </div>
            {lastUpdatedAt && (
              <div className="text-[11px] text-slate-500">
                Last updated:{' '}
                <span className="font-medium">
                  {new Date(lastUpdatedAt).toLocaleString('en-US', {
                    year: '2-digit',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {lastUpdatedByName && (
                  <>
                    {' '}
                    by <span className="font-medium">{lastUpdatedByName}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Top control bar (filters, search, export) */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Search */}
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Store Name..."
              className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm shadow-[inset_0_1px_0_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Range dropdown */}
          <Select value={range} onValueChange={(v: any) => setRange(v)}>
            <SelectTrigger className="h-9 w-[140px] rounded-md border border-slate-300 bg-white text-sm shadow-[inset_0_1px_0_rgba(0,0,0,0.03)]">
              <SelectValue placeholder="This Week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>

          {/* From */}
          <div className="flex items-center gap-2">
            <div className="text-sm text-slate-700">From:</div>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="date"
                value={from || ''}
                onChange={(e) => setFrom(e.target.value || undefined)}
                className="h-9 w-[150px] rounded-md border border-slate-300 bg-white pl-8 pr-2 text-sm shadow-[inset_0_1px_0_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          {/* To */}
          <div className="flex items-center gap-2">
            <div className="text-sm text-slate-700">To:</div>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="date"
                value={to || ''}
                onChange={(e) => setTo(e.target.value || undefined)}
                className="h-9 w-[150px] rounded-md border border-slate-300 bg-white pl-8 pr-2 text-sm shadow-[inset_0_1px_0_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="flex-1" />

          {/* Export button */}
          <Button
            onClick={handleExport}
            className="h-9 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
          >
            Export CSV
          </Button>
        </div>

        {/* Table container - fixed height; scrollable between header row and sticky TOTALS row */}
        <div className="mt-3 rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm h-[70vh]">
          <div className="w-full h-full overflow-auto">
            <table className="w-full min-w-[1100px] text-sm">
            {/* Group header row */}
            <thead className="sticky top-0 z-20">
              <tr>
                <th colSpan={4} className="px-3 py-2 text-center font-semibold text-slate-800 bg-gradient-to-b from-[#a9c7df] to-[#88b4d4] border-r border-slate-200">
                  Overview
                </th>
                <th colSpan={6} className="px-3 py-2 text-center font-semibold text-slate-800 bg-gradient-to-b from-[#bfe5c2] to-[#9ed3a1] border-r border-slate-200">
                  Image Processing
                </th>
                <th colSpan={5} className="px-3 py-2 text-center font-semibold text-slate-800 bg-gradient-to-b from-[#d7bff0] to-[#c5a3e6]">
                  Financials
                </th>
              </tr>

              {/* Column header row */}
              <tr className="text-slate-700">
                {/* Overview */}
                <th className="px-3 py-2 bg-[#cfe3f2] border-t border-slate-200 border-r">St #</th>
                <th className="px-3 py-2 bg-[#cfe3f2] border-t border-slate-200 border-r">Job ID</th>
                <th className="px-3 py-2 bg-[#cfe3f2] border-t border-slate-200 border-r">Store</th>
                <th className="px-3 py-2 bg-[#cfe3f2] border-t border-slate-200 border-r">Package</th>

                {/* Image processing */}
                <th className="px-3 py-2 bg-[#d8efd9] border-t border-slate-200 border-r">Orig.</th>
                <th className="px-3 py-2 bg-[#d8efd9] border-t border-slate-200 border-r">Gem 3.0</th>
                <th className="px-3 py-2 bg-[#d8efd9] border-t border-slate-200 border-r">Pose 1</th>
                <th className="px-3 py-2 bg-[#d8efd9] border-t border-slate-200 border-r">Pose 2</th>
                <th className="px-3 py-2 bg-[#d8efd9] border-t border-slate-200 border-r">Pose 3</th>
                <th className="px-3 py-2 bg-[#d8efd9] border-t border-slate-200 border-r">Proc(e)</th>

                {/* Financials */}
                <th className="px-3 py-2 bg-[#ead9fb] border-t border-slate-200 border-r">Credits / Job</th>
                <th className="px-3 py-2 bg-[#ead9fb] border-t border-slate-200 border-r">Gemini Costs (USD)</th>
                <th className="px-3 py-2 bg-[#ead9fb] border-t border-slate-200 border-r">USD/EGP</th>
                <th className="px-3 py-2 bg-[#ead9fb] border-t border-slate-200 border-r">Cost</th>
                <th className="px-3 py-2 bg-[#ead9fb] border-t border-slate-200">Profit</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row: any) => {
                const isFailure = !!row.error_code;
                const procSec =
                  row.processing_time_sec != null ? `${Math.round(Number(row.processing_time_sec))}s` : '-';

                // Package badge (if you have it; fallback to Ready/No)
                const pkgLabel =
                  row._pkgLabel ||
                  row.package ||
                  row.package_name ||
                  (row.ready_for_publish ? 'Elite' : 'Pro');
                const pkgVariant = pkgLabel?.toLowerCase?.().includes('elite') ? 'default' : 'secondary';

                return (
                  <tr key={row.job_id || row.display_job_id} className="border-t border-slate-200">
                    {/* Overview */}
                    <td className="px-3 py-2 border-r border-slate-200 text-slate-700">{row.st_no}</td>
                    <td className="px-3 py-2 border-r border-slate-200 font-medium text-slate-900">
                      {row.display_job_id || '-'}
                    </td>
                    <td className="px-3 py-2 border-r border-slate-200 text-slate-800">{row.store_name || '-'}</td>
                    <td className="px-3 py-2 border-r border-slate-200">
                      <Badge
                        variant={pkgVariant}
                        className={
                          pkgVariant === 'default'
                            ? 'bg-[#7b4bb7] hover:bg-[#6d3eaa] text-white rounded-md px-2'
                            : 'bg-[#2b6cb0] hover:bg-[#245f9c] text-white rounded-md px-2'
                        }
                      >
                        {pkgLabel}
                      </Badge>
                    </td>

                    {/* Image Processing thumbs */}
                    <td className="px-3 py-2 border-r border-slate-200">
                      <Thumb url={row.original_file_url} />
                    </td>
                    <td className="px-3 py-2 border-r border-slate-200">
                      <Thumb url={row.raw_pose1_url} />
                    </td>
                    <td className="px-3 py-2 border-r border-slate-200">
                      <Thumb url={row.front_pose_url} />
                    </td>
                    <td className="px-3 py-2 border-r border-slate-200">
                      <Thumb url={row.diff_pose_url} />
                    </td>
                    <td className="px-3 py-2 border-r border-slate-200">
                      <Thumb url={row.third_pose_url} />
                    </td>

                    {/* Proc(e) w/ failure pill like screenshot */}
                    <td className="px-3 py-2 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-800">{procSec}</span>
                        {isFailure ? (
                          <span className="inline-flex items-center rounded-full bg-rose-200 text-rose-900 px-2 py-0.5 text-xs font-semibold">
                            Failure
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Financials (computed on the dashboard) */}
                    <td className="px-3 py-2 border-r border-slate-200 text-slate-800">
                      {row._creditsPerJob != null ? Math.trunc(Number(row._creditsPerJob) || 0) : '-'}
                    </td>
                    <td className="px-3 py-2 border-r border-slate-200 text-slate-800">
                      {row._geminiCostUsd != null ? `$${Number(row._geminiCostUsd).toFixed(2)}` : '$0.00'}
                    </td>
                    <td className="px-3 py-2 border-r border-slate-200 text-slate-800">
                      {row._usdToEgp != null ? Number(row._usdToEgp).toFixed(2) : DEFAULT_USD_TO_EGP.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 border-r border-slate-200 text-slate-800">
                      {row._costComputed != null ? Number(row._costComputed).toFixed(2) : '-'}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      <span className={Number(row._profitComputed) < 0 ? 'text-rose-700' : 'text-emerald-700'}>
                        {row._profitComputed != null ? Number(row._profitComputed).toFixed(2) : '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Totals row (matches screenshot layout) */}
              <tr className="border-t border-slate-200 bg-slate-50 sticky bottom-0 z-20">
                <td className="px-3 py-2 font-semibold text-slate-700" colSpan={10}>
                  TOTALS
                </td>
                <td className="px-3 py-2 font-semibold text-slate-900 border-l border-slate-200">
                  {Math.trunc(totals.credits)}
                </td>
                <td className="px-3 py-2 font-semibold text-slate-900">
                  ${totals.geminiUsd.toFixed(2)}
                </td>
                <td className="px-3 py-2 font-semibold text-slate-900" />
                <td className="px-3 py-2 font-semibold text-slate-900">
                  {totals.cost.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  <span className={totals.profit < 0 ? 'text-rose-700' : 'text-emerald-700'}>
                    {totals.profit.toFixed(2)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        {/* Store filter (kept functional, aligned under table) */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span className="text-slate-700">Store:</span>
          <Select value={storeId ?? '__ALL__'} onValueChange={(v) => setStoreId(v === '__ALL__' ? undefined : v)}>
            <SelectTrigger className="h-9 w-[220px] rounded-md border border-slate-300 bg-white text-sm">
              <SelectValue placeholder="All stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">All stores</SelectItem>
              {(storesResp?.data || []).map((s: any) => (
                <SelectItem key={s.store_id} value={s.store_id}>
                  {s.store_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
  );
}
