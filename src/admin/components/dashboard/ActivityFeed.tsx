import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  UserPlus,
  AlertTriangle,
  Star,
  CheckCircle,
  Package,
  Ticket,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@admin/utils/cn';
import { listItemVariants, staggerContainer } from '../../animations/variants';

const iconMap: Record<string, React.ElementType> = {
  ShoppingCart,
  UserPlus,
  AlertTriangle,
  Star,
  CheckCircle,
  Package,
  Ticket,
  CreditCard,
};

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
  gold: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-violet-100 text-violet-700',
  pink: 'bg-pink-100 text-pink-700',
};

interface ActivityItem {
  id: string;
  type: string;
  icon: string;
  user: string;
  action: string;
  detail?: string;
  amount?: string;
  time: string;
  link?: string;
  color?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
          <CheckCircle className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No activity yet</p>
          <p className="text-xs mt-1">Activity will appear here as your store gets orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
          <p className="text-xs text-slate-500 mt-0.5">Latest actions in your store</p>
        </div>
        <Link
          to="/admin/orders"
          className="flex items-center gap-1 text-xs font-medium text-admin-deep-forest hover:underline"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-1"
      >
        {activities.slice(0, 7).map((activity, index) => {
          const Icon = iconMap[activity.icon] || ShoppingCart;
          const colorClass = colorMap[activity.color ?? 'blue'] ?? colorMap.blue;
          const isLast = index === activities.slice(0, 7).length - 1;

          return (
            <motion.div key={activity.id} variants={listItemVariants}>
              <div className="relative flex items-start gap-3 py-2.5">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-[17px] top-9 bottom-0 w-px bg-slate-100" />
                )}

                {/* Icon */}
                <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full', colorClass)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm text-slate-700 leading-snug">
                    <span className="font-semibold text-slate-900">{activity.user}</span>
                    {' '}
                    <span>{activity.action}</span>
                  </p>
                  {activity.detail && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{activity.detail}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">{activity.time}</p>
                </div>

                {/* Link arrow */}
                {activity.link && (
                  <Link
                    to={activity.link}
                    className="flex-shrink-0 mt-1 text-slate-300 hover:text-admin-deep-forest transition-colors"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
