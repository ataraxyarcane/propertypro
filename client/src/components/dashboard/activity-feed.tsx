import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, 
  FileText, 
  Drill, 
  DollarSign, 
  UserPlus,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Activity {
  id: string;
  type: 'property' | 'lease' | 'maintenance' | 'payment' | 'user';
  title: string;
  description: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  onViewAll?: () => void;
}

export default function ActivityFeed({ activities, onViewAll }: ActivityFeedProps) {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'property':
        return <Building className="text-primary" size={20} />;
      case 'lease':
        return <FileText className="text-secondary" size={20} />;
      case 'maintenance':
        return <Drill className="text-destructive" size={20} />;
      case 'payment':
        return <DollarSign className="text-success" size={20} />;
      case 'user':
        return <UserPlus className="text-accent" size={20} />;
      default:
        return <Bell size={20} />;
    }
  };
  
  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b flex-row justify-between items-center space-y-0">
        <CardTitle className="font-medium text-base">Recent Activity</CardTitle>
        {onViewAll && (
          <Button variant="link" className="text-primary p-0 h-auto" onClick={onViewAll}>
            View all
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-y-auto max-h-80">
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="px-4 py-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    {getIcon(activity.type)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">
                      <span className="font-medium">{activity.title}</span>
                    </p>
                    <p className="text-sm text-neutral-mid">{activity.description}</p>
                    <p className="text-xs text-neutral-mid mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              </li>
            ))}
            
            {activities.length === 0 && (
              <li className="px-4 py-6 text-center">
                <p className="text-sm text-neutral-mid">No recent activity</p>
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
