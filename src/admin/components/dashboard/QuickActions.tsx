import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Layers, Award, Ticket, Package, FileText, ShoppingCart, Tag } from 'lucide-react';
import { cardVariants, staggerContainer } from '../../animations/variants';

const actions = [
  { title: 'Add Product', icon: Plus, href: '/admin/products/new', color: 'bg-admin-deep-forest text-white', hoverBg: 'hover:bg-admin-deep-forest/90' },
  { title: 'Add Category', icon: Layers, href: '/admin/categories', color: 'bg-slate-100 text-slate-700', hoverBg: 'hover:bg-slate-200' },
  { title: 'Add Brand', icon: Award, href: '/admin/brands', color: 'bg-slate-100 text-slate-700', hoverBg: 'hover:bg-slate-200' },
  { title: 'Create Coupon', icon: Ticket, href: '/admin/coupons', color: 'bg-amber-50 text-amber-700', hoverBg: 'hover:bg-amber-100' },
  { title: 'Update Inventory', icon: Package, href: '/admin/inventory', color: 'bg-slate-100 text-slate-700', hoverBg: 'hover:bg-slate-200' },
  { title: 'Generate Report', icon: FileText, href: '/admin/reports', color: 'bg-slate-100 text-slate-700', hoverBg: 'hover:bg-slate-200' },
  { title: 'Manage Orders', icon: ShoppingCart, href: '/admin/orders', color: 'bg-slate-100 text-slate-700', hoverBg: 'hover:bg-slate-200' },
  { title: 'Manage Promos', icon: Tag, href: '/admin/coupons', color: 'bg-slate-100 text-slate-700', hoverBg: 'hover:bg-slate-200' },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h3>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-2"
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.title} variants={cardVariants}>
              <Link to={action.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${action.color} ${action.hoverBg}`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs font-semibold leading-tight">{action.title}</span>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
