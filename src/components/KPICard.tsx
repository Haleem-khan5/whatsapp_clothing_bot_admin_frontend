import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  unit?: string;
  helperText?: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function KPICard({
  title,
  value,
  icon: Icon,
  unit,
  helperText,
  description,
  trend,
}: KPICardProps) {
  const resolvedHelperText = helperText ?? description;

  return (
    <Card className="flex flex-col justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e4edf9]">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-slate-600">
                  {title}
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold leading-none text-slate-900">
                    {value}
                  </span>
                  {unit && (
                    <span className="text-[11px] font-medium text-slate-500">
                      {unit}
                    </span>
                  )}
                </div>
              </div>

              {trend && (
                <span
                  className={[
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    trend.isPositive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700',
                  ].join(' ')}
                >
                  {trend.isPositive ? '▲' : '▼'} {Math.abs(trend.value)}%
                </span>
              )}
            </div>

            {resolvedHelperText && (
              <p className="mt-1 text-[11px] text-slate-500">
                {resolvedHelperText}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
