import { useMemo, useState, type CSSProperties } from 'react';
import { KPICard } from '@/components/KPICard';
import {
  Store,
  Image as ImageIcon,
  Video as VideoIcon,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useKpi } from '@/hooks/useKpi';

const Index = () => {
  const [dateRange, setDateRange] = useState('this-month');
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();

  const params = useMemo(
    () => ({ range: dateRange as any, from, to }),
    [dateRange, from, to],
  );
  const { data } = useKpi(params);

  const resp = data?.data;

  const defaultKpi = {
    stores_total: 0,
    stores_new: 0,
    transactions_egp: 0,
    refunds_egp: 0,
    image_jobs_count: 0,
    image_jobs_cost_egp: 0,
    video_jobs_count: 0,
    video_jobs_cost_egp: 0,
    net_cashflow_egp: 0,

    stores_tier_basic_pct: 50,
    stores_tier_pro_pct: 25,
    stores_tier_elite_pct: 15,
    stores_tier_trial_pct: 10,

    active_pct: 55,
    less_active_pct: 20,
    inactive_pct: 25,

    stores_topped_up: 0,
    avg_topup_egp: 0,

    basic_avg_proc_secs: 0,
    pro_avg_proc_secs: 0,
    elite_avg_proc_secs: 0,

    error_rate_pct: 0,
    errors_total: 0,
    jobs_total: 0,
  };

  const r = resp ?? defaultKpi;

  const formatNumber = (n: number | null | undefined) =>
    (n ?? 0).toLocaleString('en-US');

  const revenueGross = r.transactions_egp ?? 0;
  const totalCosts = (r.image_jobs_cost_egp ?? 0) + (r.video_jobs_cost_egp ?? 0);
  const totalRefunds = r.refunds_egp ?? 0;
  const costsAndRefunds = totalCosts + totalRefunds;
  const netProfit = revenueGross - costsAndRefunds;

  // ----- colourful "graphs" based on values -----

  const basicTier = r.stores_tier_basic_pct ?? 0;
  const proTier = r.stores_tier_pro_pct ?? 0;
  const eliteTier = r.stores_tier_elite_pct ?? 0;
  const trialTier = r.stores_tier_trial_pct ?? 0;
  const tierPieStyle: CSSProperties = {
    backgroundImage: `conic-gradient(
      #4f81ff 0 ${basicTier}%,
      #36b37e ${basicTier}% ${basicTier + proTier}%,
      #6554c0 ${basicTier + proTier}% ${basicTier + proTier + eliteTier}%,
      #ffab00 ${basicTier + proTier + eliteTier}% 100%
    )`,
  };

  const active = r.active_pct ?? 0;
  const lessActive = r.less_active_pct ?? 0;
  const inactive = r.inactive_pct ?? 0;
  const activityPieStyle: CSSProperties = {
    backgroundImage: `conic-gradient(
      #4f81ff 0 ${active}%,
      #36b37e ${active}% ${active + lessActive}%,
      #ff5630 ${active + lessActive}% 100%
    )`,
  };

  const basicProc = r.basic_avg_proc_secs ?? 0;
  const proProc = r.pro_avg_proc_secs ?? 0;
  const eliteProc = r.elite_avg_proc_secs ?? 0;
  const maxProc = Math.max(basicProc, proProc, eliteProc, 1);

  const procRows = [
    { label: 'Basic', value: basicProc, color: '#4f81ff' },
    { label: 'Pro', value: proProc, color: '#36b37e' },
    { label: 'Elite', value: eliteProc, color: '#ff5630' },
  ];

  return (
    <div className="min-h-screen bg-[#edf3fb] px-4 py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        {/* Top bar: Overview + Date Period */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold text-slate-700">Overview</h1>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-500">
              Date Period:
            </span>

            <div className="flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 shadow-sm">
              <Select
                value={dateRange}
                onValueChange={(v) => {
                  setDateRange(v);
                  if (v !== 'custom') {
                    setFrom(undefined);
                    setTo(undefined);
                  }
                }}
              >
                <SelectTrigger className="h-6 w-[220px] border-0 bg-transparent p-0 text-xs shadow-none focus:ring-0">
                  <SelectValue placeholder="This Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {dateRange === 'custom' && (
                <div className="ml-2 flex gap-1">
                  <input
                    type="date"
                    className="h-6 rounded border bg-white px-2 text-[10px]"
                    value={from || ''}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                  <input
                    type="date"
                    className="h-6 rounded border bg-white px-2 text-[10px]"
                    value={to || ''}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================== ROW 1 ===================== */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* LEFT: Overview card */}
          <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-[13px] font-semibold text-slate-700">
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Stores Registered */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e4edf9]">
                    <Store className="h-4 w-4 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-600">
                      Stores Registered
                    </p>
                    <p className="text-xl font-extrabold text-slate-900">
                      {formatNumber(r.stores_total)}
                    </p>
                  </div>
                </div>

                {/* Active Stores */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e4edf9]">
                    <Store className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-600">
                      Active Stores
                    </p>
                    <p className="text-xl font-extrabold text-slate-900">
                      {formatNumber(r.stores_new)}{' '}
                      <span className="text-xs font-medium text-slate-500">
                        Active
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Tier distribution */}
              <div>
                <p className="mb-2 text-[11px] font-semibold text-slate-600">
                  User Tier Distribution
                </p>
                <div className="flex items-center gap-4">
                  {/* real pie based on values */}
                  <div
                    className="h-24 w-24 rounded-full border border-slate-200"
                    style={tierPieStyle}
                  />
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <p>
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#4f81ff]" />
                      Basic: {basicTier}% 
                    </p>
                    <p>
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#36b37e]" />
                      Pro: {proTier}%
                    </p>
                    <p>
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#6554c0]" />
                      Elite: {eliteTier}%
                    </p>
                    <p>
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#ffab00]" />
                      Trial: {trialTier}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT side of row 1: two sub-rows */}
          <div className="flex flex-col gap-4">
            {/* Sub-row 1: Image & Video jobs (2 columns) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <KPICard
                title="Image Jobs"
                value={formatNumber(r.image_jobs_count)}
                unit="Jobs"
                icon={ImageIcon}
                helperText="Total image jobs in period"
              />
              <KPICard
                title="Video Jobs"
                value={formatNumber(r.video_jobs_count)}
                unit="Jobs"
                icon={VideoIcon}
                helperText="Total video jobs in period"
              />
            </div>

            {/* Sub-row 2: User Activity Status (full width) */}
            <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-[13px] font-semibold text-slate-700">
                  User Activity Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div
                    className="h-24 w-24 rounded-full border border-slate-200"
                    style={activityPieStyle}
                  />
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <p>
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#4f81ff]" />
                      Active (Last 7d): {active}%
                    </p>
                    <p>
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#36b37e]" />
                      Less Active (Last 30d): {lessActive}%
                    </p>
                    <p>
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#ff5630]" />
                      Inactive (Since Reg): {inactive}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ===================== ROW 2 ===================== */}
        <div className="grid gap-4">
          <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-[13px] font-semibold text-slate-700">
                Financials
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-3 md:grid-cols-3">
                {/* Revenue (Gross) */}
                <div className="space-y-1 rounded-md border border-emerald-200 bg-[#e8f7ef] px-3 py-2">
                  <p className="text-[11px] font-semibold text-emerald-700">
                    Revenue (Gross)
                  </p>
                  <p className="text-xl font-extrabold text-emerald-800">
                    EGP {formatNumber(revenueGross)}
                  </p>
                  <p className="text-[11px] text-emerald-700/80">
                    Image &amp; Video revenue
                  </p>
                </div>

                {/* Costs & Refunds */}
                <div className="space-y-1 rounded-md border border-rose-200 bg-[#feecef] px-3 py-2">
                  <p className="text-[11px] font-semibold text-rose-700">
                    Costs &amp; Refunds
                  </p>
                  <p className="text-xl font-extrabold text-rose-800">
                    EGP {formatNumber(costsAndRefunds)}
                  </p>
                  <p className="text-[11px] text-rose-700/80 leading-snug">
                    Image costs: EGP {formatNumber(r.image_jobs_cost_egp)}
                    <br />
                    Video costs: EGP {formatNumber(r.video_jobs_cost_egp)}
                    <br />
                    Refunds: EGP {formatNumber(totalRefunds)}
                  </p>
                </div>

                {/* Net Profit */}
                <div className="flex flex-col justify-center rounded-md border border-emerald-200 bg-[#f3fbf6] px-3 py-2">
                  <p className="text-[11px] font-semibold text-emerald-700">
                    Net Profit
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-700">
                    EGP {formatNumber(netProfit)}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Revenue – Cost – Refunds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===================== ROW 3 (unchanged but colourful bars) ===================== */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Top Ups Overview */}
          <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-[13px] font-semibold text-slate-700">
                Top Ups Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4 text-[11px] text-slate-600">
              <p className="text-lg font-extrabold text-slate-900">
                Total Top Ups: EGP {formatNumber(r.transactions_egp)}
              </p>
              <p>{formatNumber(r.stores_topped_up)} Stores Topped Up</p>
              <p>Avg Top Up: EGP {formatNumber(r.avg_topup_egp)}</p>
            </CardContent>
          </Card>

          {/* Avg Processing Time by Package */}
          <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-[13px] font-semibold text-slate-700">
                Avg Processing Time by Package
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-[11px] text-slate-600">
              {procRows.map((row) => (
                <div key={row.label} className="space-y-1">
                  <p className="font-semibold">{row.label}</p>
                  <div className="h-3 rounded bg-[#e4edf9]">
                    <div
                      className="h-3 rounded"
                      style={{
                        width: `${(row.value / maxProc) * 100}%`,
                        backgroundColor: row.color,
                      }}
                    />
                  </div>
                  <p>{Math.round(row.value)} sec</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Error Rates */}
          <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-[13px] font-semibold text-slate-700">
                Error Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4 text-[11px] text-slate-600">
              <p className="text-2xl font-extrabold text-[#e55353]">
                {typeof r.error_rate_pct === 'number'
                  ? `${r.error_rate_pct.toFixed(1)}% Error Rate`
                  : `${r.error_rate_pct} Error Rate`}
              </p>
              <p>
                {formatNumber(r.errors_total)} Errors /{' '}
                {formatNumber(r.jobs_total)} Total Jobs
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
