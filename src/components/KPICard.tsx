import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function KPICard({ title, value, icon: Icon, description, trend }: KPICardProps) {
  return (
    <Card className="overflow-hidden rounded-xl border border-indigo-100/70 bg-white/60 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-indigo-300/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[13px] font-semibold tracking-wide text-indigo-700">{title}</CardTitle>
        <div className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center ring-1 ring-indigo-100">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold tracking-tight text-gray-900">{value}</div>
        {description && (
          <p className="text-xs text-slate-600 mt-1">{description}</p>
        )}
        {trend && (
          <span
            className={`${trend.isPositive ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-red-50 text-red-700 ring-red-200'} inline-flex items-center mt-2 rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}% from last period
          </span>
        )}
      </CardContent>
    </Card>
  );
}
