import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatsTrendType = 'up' | 'down' | 'neutral';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    type: StatsTrendType;
    value: string;
  };
  iconColor?: 'primary' | 'secondary' | 'accent' | 'destructive';
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  iconColor = 'primary' 
}: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    accent: 'bg-accent text-white',
    destructive: 'bg-destructive text-white'
  };
  
  const trendClasses = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-warning'
  };
  
  const trendIcons = {
    up: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <path d="m18 15-6-6-6 6"/>
      </svg>
    ),
    down: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    ),
    neutral: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <path d="M8 12h8"/>
      </svg>
    )
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral-mid text-sm">{title}</p>
            <p className="text-2xl font-medium mt-1">{value}</p>
          </div>
          <div className={cn('p-2 rounded-full', colorClasses[iconColor])}>
            <Icon size={20} />
          </div>
        </div>
        
        {trend && (
          <div className={cn("mt-2 text-sm flex items-center", trendClasses[trend.type])}>
            {trendIcons[trend.type]}
            <span>{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
