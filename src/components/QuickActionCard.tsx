import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickActionCardProps {
  title: string;
  icon: LucideIcon;
  to: string;
  description: string;
}

export function QuickActionCard({ title, icon: Icon, to, description }: QuickActionCardProps) {
  return (
    <Link to={to} className="block h-full">
      <Card className="qa-card qa-button group relative h-full overflow-hidden cursor-pointer rounded-xl border border-indigo-100/70 bg-white/60 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-indigo-300/50">
        <span className="qa-shine" />
        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-indigo-100 via-transparent to-pink-100" />
        <CardContent className="flex flex-col items-center text-center h-full min-h-[150px] sm:min-h-[170px] p-5 sm:p-6 gap-3">
          <div className="flex-1 w-full">
            <h3 className="font-semibold text-base sm:text-lg leading-snug tracking-tight whitespace-normal break-normal text-slate-900">{title}</h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 whitespace-normal break-normal">{description}</p>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-white group-hover:ring-indigo-300 transition-colors">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
