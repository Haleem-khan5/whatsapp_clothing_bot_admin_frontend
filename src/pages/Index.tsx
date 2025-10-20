import { useMemo, useState } from 'react';
import { KPICard } from '@/components/KPICard';
import { QuickActionCard } from '@/components/QuickActionCard';
import { Store, DollarSign, Image, Video, Receipt, RotateCcw, Download, Phone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKpi } from '@/hooks/useKpi';

const Index = () => {
  const [dateRange, setDateRange] = useState('today');
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();

  const params = useMemo(() => ({ range: dateRange as any, from, to }), [dateRange, from, to]);
  const { data, isLoading } = useKpi(params);

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
  };
  const r = resp ?? defaultKpi;
  const kpis = [
    { title: 'Stores (Total)', value: r.stores_total ?? 0, icon: Store, description: 'All active stores' },
    { title: 'Stores (New)', value: r.stores_new ?? 0, icon: Store, description: 'Created in range' },
    { title: 'Top Ups (EGP)', value: `EGP ${(r.transactions_egp ?? 0)?.toLocaleString?.() ?? (r.transactions_egp ?? 0)}`, icon: DollarSign, description: 'Transactions in range' },
    { title: 'Refunds (EGP)', value: `EGP ${(r.refunds_egp ?? 0)?.toLocaleString?.() ?? (r.refunds_egp ?? 0)}`, icon: DollarSign, description: 'Refunds in range' },
    { title: 'Image Jobs', value: r.image_jobs_count ?? 0, icon: Image, description: 'Processed in range' },
    { title: 'Image Costs (EGP)', value: `EGP ${(r.image_jobs_cost_egp ?? 0)?.toLocaleString?.() ?? (r.image_jobs_cost_egp ?? 0)}`, icon: DollarSign, description: 'Costs in range' },
    { title: 'Video Jobs', value: r.video_jobs_count ?? 0, icon: Video, description: 'Processed in range' },
    { title: 'Video Costs (EGP)', value: `EGP ${(r.video_jobs_cost_egp ?? 0)?.toLocaleString?.() ?? (r.video_jobs_cost_egp ?? 0)}`, icon: DollarSign, description: 'Costs in range' },
  ];

  const quickActions = [
    { title: 'WhatsApp Numbers', icon: Phone, to: '/phones', description: 'Manage phone numbers' },
    { title: 'Transactions', icon: Receipt, to: '/transactions', description: 'View payment history' },
    { title: 'Refunds', icon: RotateCcw, to: '/refunds', description: 'Process refunds' },
    { title: 'Video Jobs', icon: Video, to: '/video-jobs', description: 'Manage video jobs' },
    { title: 'Downloads', icon: Download, to: '/downloads', description: 'Download reports' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-primary bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your business metrics</p>
        </div>
        {/* Filters moved below into Overview */}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-stretch auto-rows-fr">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-2xl font-bold">Overview</h2>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={(v) => { setDateRange(v); if (v !== 'custom') { setFrom(undefined); setTo(undefined); } }}>
              <SelectTrigger className="w-[180px]">
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
                <input type="date" className="h-9 rounded-md border bg-background px-3 text-sm" value={from || ''} onChange={(e) => setFrom(e.target.value)} />
                <input type="date" className="h-9 rounded-md border bg-background px-3 text-sm" value={to || ''} onChange={(e) => setTo(e.target.value)} />
              </div>
            )}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading && (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <KPICard key={i} title="Loading..." value={"--"} icon={Store} description="" />
              ))}
            </>
          )}
          {!isLoading && kpis.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
