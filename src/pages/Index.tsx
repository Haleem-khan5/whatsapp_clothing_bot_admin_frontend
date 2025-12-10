import { useMemo, useState } from 'react';
import { KPICard } from '@/components/KPICard';
import {
  Store,
  DollarSign,
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
  const { data, isLoading } = useKpi(params);

  const resp = data?.data;

  const defaultKpi = {
    // existing
    stores_total: 0,
    stores_new: 0,
    transactions_egp: 0,
    refunds_egp: 0,
    image_jobs_count: 0,
    image_jobs_cost_egp: 0,
    video_jobs_count: 0,
    video_jobs_cost_egp: 0,

    // NEW – you can wire these from API when ready
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

  return (
    <div className="space-y-6">
      {/* Top header with “Date Period” like mock */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your business metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Date Period:
          </span>
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
            <SelectTrigger className="w-[220px] bg-white">
              <SelectValue placeholder="Select range" />
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
            <div className="flex gap-2">
              <input
                type="date"
                className="h-9 rounded-md border bg-background px-3 text-xs"
                value={from || ''}
                onChange={(e) => setFrom(e.target.value)}
              />
              <input
                type="date"
                className="h-9 rounded-md border bg-background px-3 text-xs"
                value={to || ''}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* === ROW 1: Overview + Image Jobs + Video Jobs === */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Overview card (stores + tier distribution) */}
        <Card className="lg:col-span-2 border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Stores Registered */}
              <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white">
                  <Store className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">
                    Stores Registered
                  </p>
                  <p className="text-lg font-extrabold text-slate-900">
                    {formatNumber(r.stores_total)}{' '}
                    <span className="text-xs font-medium text-slate-500">
                      Total
                    </span>
                  </p>
                </div>
              </div>

              {/* Active Stores */}
              <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white">
                  <Store className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">
                    Active Stores
                  </p>
                  <p className="text-lg font-extrabold text-slate-900">
                    {formatNumber(r.stores_new)}{' '}
                    <span className="text-xs font-medium text-slate-500">
                      Active
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* User Tier Distribution – pie-chart placeholder */}
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-600">
                User Tier Distribution
              </p>
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 rounded-full bg-slate-100" />
                <div className="space-y-1 text-xs text-slate-600">
                  <p>
                    <span className="inline-block h-2 w-2 rounded-full bg-sky-500 mr-1" />
                    Basic: {r.stores_tier_basic_pct}% (750)
                  </p>
                  <p>
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1" />
                    Pro: {r.stores_tier_pro_pct}% (375)
                  </p>
                  <p>
                    <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 mr-1" />
                    Elite: {r.stores_tier_elite_pct}% (125)
                  </p>
                  <p>
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1" />
                    Trial: {r.stores_tier_trial_pct}% (200)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Jobs card like mock */}
        <KPICard
          title="Image Jobs"
          value={formatNumber(r.image_jobs_count)}
          unit="Jobs"
          icon={ImageIcon}
          helperText="Total jobs in period"
        />

        {/* Video Jobs card like mock */}
        <KPICard
          title="Video Jobs"
          value={formatNumber(r.video_jobs_count)}
          unit="Jobs"
          icon={VideoIcon}
          helperText="Total jobs in period"
        />
      </div>

      {/* === ROW 2: User Activity Status + Financials === */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* User Activity Status card */}
        <Card className="lg:col-span-2 border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              User Activity Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-slate-100" />
              <div className="space-y-1 text-xs text-slate-600">
                <p>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-500" />
                  Active (Last 7d): {r.active_pct}%
                </p>
                <p>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Less Active (Last 30d): {r.less_active_pct}%
                </p>
                <p>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-500" />
                  Inactive (Since Reg): {r.inactive_pct}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financials – 3 columns like screenshot */}
        <Card className="lg:col-span-2 border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Financials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {/* Revenue (Gross) */}
              <div className="space-y-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                <p className="text-xs font-semibold text-emerald-700">
                  Revenue (Gross)
                </p>
                <p className="text-lg font-extrabold text-emerald-800">
                  EGP {formatNumber(revenueGross)}
                </p>
                <p className="text-[11px] text-emerald-700/80">
                  Image &amp; Video revenue
                </p>
              </div>

              {/* Costs & Refunds */}
              <div className="space-y-1 rounded-md border border-rose-200 bg-rose-50 px-3 py-2">
                <p className="text-xs font-semibold text-rose-700">
                  Costs &amp; Refunds
                </p>
                <p className="text-lg font-extrabold text-rose-800">
                  EGP {formatNumber(costsAndRefunds)}
                </p>
                <p className="text-[11px] text-rose-700/80">
                  Image costs: EGP {formatNumber(r.image_jobs_cost_egp)}
                  <br />
                  Video costs: EGP {formatNumber(r.video_jobs_cost_egp)}
                  <br />
                  Refunds: EGP {formatNumber(r.refunds_egp)}
                </p>
              </div>

              {/* Net Profit */}
              <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs font-semibold text-emerald-700">
                  Net Profit
                </p>
                <p className="text-lg font-extrabold text-emerald-700">
                  EGP {formatNumber(netProfit)}
                </p>
                <p className="text-[11px] text-slate-600">
                  Revenue – Costs – Refunds
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* === ROW 3: Top Ups Overview + Avg Processing + Error Rates === */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Ups Overview */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Top Ups Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-600">
            <p className="text-lg font-extrabold text-slate-900">
              Total Top Ups: EGP {formatNumber(r.transactions_egp)}
            </p>
            <p>Stores topped up: {formatNumber(r.stores_topped_up)}</p>
            <p>Avg Top Up: EGP {formatNumber(r.avg_topup_egp)}</p>
          </CardContent>
        </Card>

        {/* Avg Processing Time by Package */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Avg Processing Time by Package
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-600">
            <div className="space-y-1">
              <p className="font-semibold">Basic</p>
              <div className="h-2 rounded bg-slate-100">
                <div className="h-2 rounded bg-sky-400" style={{ width: '40%' }} />
              </div>
              <p>{Math.round(r.basic_avg_proc_secs)} sec</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Pro</p>
              <div className="h-2 rounded bg-slate-100">
                <div className="h-2 rounded bg-sky-400" style={{ width: '60%' }} />
              </div>
              <p>{Math.round(r.pro_avg_proc_secs)} sec</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Elite</p>
              <div className="h-2 rounded bg-slate-100">
                <div className="h-2 rounded bg-sky-400" style={{ width: '80%' }} />
              </div>
              <p>{Math.round(r.elite_avg_proc_secs)} sec</p>
            </div>
          </CardContent>
        </Card>

        {/* Error Rates */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Error Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-600">
            <p className="text-xl font-extrabold text-rose-600">
              {r.error_rate_pct.toFixed ? r.error_rate_pct.toFixed(1) : r.error_rate_pct}
              % Error Rate
            </p>
            <p>
              {formatNumber(r.errors_total)} Errors /{' '}
              {formatNumber(r.jobs_total)} Total Jobs
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
