import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Users,
  Box,
  MessageSquare,
  Ticket,
  Truck,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react';
import { cn } from '@admin/utils/cn';
import { ScrollArea } from '../ui/ScrollArea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';


interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavClick?: () => void;
}

const navGroups = [
  {
    label: null,
    items: [
      { title: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { title: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
      { title: 'Customers', icon: Users, href: '/admin/customers' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { title: 'Products', icon: Package, href: '/admin/products' },
      { title: 'Categories', icon: Layers, href: '/admin/categories' },
      { title: 'Brands', icon: Award, href: '/admin/brands' },
      { title: 'Inventory', icon: Box, href: '/admin/inventory' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { title: 'Coupons', icon: Ticket, href: '/admin/coupons' },
      { title: 'Reviews', icon: MessageSquare, href: '/admin/reviews' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { title: 'Reports', icon: FileText, href: '/admin/reports' },
      { title: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Delivery', icon: Truck, href: '/admin/delivery' },
      { title: 'Settings', icon: Settings, href: '/admin/settings' },
    ],
  },
];

function NavItem({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: { title: string; icon: React.ElementType; href: string };
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  const content = (
    <Link to={item.href} onClick={onClick}>
      <motion.div
        whileHover={{ x: collapsed ? 0 : 2 }}
        className={cn(
          'relative flex items-center rounded-lg text-sm font-medium transition-all duration-150 group',
          collapsed ? 'h-10 w-10 justify-center mx-auto' : 'h-9 px-3 gap-3',
          isActive
            ? 'bg-admin-deep-forest text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-admin-deep-forest'
        )}
      >
        {/* Active left bar */}
        {isActive && !collapsed && (
          <motion.div
            layoutId="activeBar"
            className="absolute -left-4 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-admin-luxury-gold"
          />
        )}
        <Icon
          className={cn(
            'flex-shrink-0 transition-colors',
            collapsed ? 'h-5 w-5' : 'h-4 w-4',
            isActive ? 'text-white' : 'text-slate-500 group-hover:text-admin-deep-forest'
          )}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              {item.title}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            {item.title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

export function Sidebar({ collapsed, onToggleCollapse, onNavClick }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  return (
    <div className={cn(
      'flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out overflow-hidden',
      collapsed ? 'w-[72px]' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center border-b border-slate-200 flex-shrink-0',
        collapsed ? 'justify-center px-0' : 'px-5 justify-between'
      )}>
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div
              key="icon-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-admin-deep-forest"
            >
              <span className="text-sm font-black text-white">9</span>
            </motion.div>
          ) : (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              <span className="text-lg font-black tracking-tight text-admin-deep-forest">9/10 Mart</span>
              <span className="text-[10px] font-medium text-admin-luxury-gold uppercase tracking-widest">Admin Console</span>
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Collapse toggle button when collapsed */}
      {collapsed && (
        <div className="flex justify-center py-2 border-b border-slate-100">
          <button
            onClick={onToggleCollapse}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className={cn('flex flex-col', collapsed ? 'px-2 gap-1' : 'px-3 gap-0.5')}>
          {navGroups.map((group, gi) => (
            <div key={gi} className={collapsed ? 'mb-2' : 'mb-1'}>
              {/* Group label */}
              <AnimatePresence>
                {!collapsed && group.label && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Collapsed group separator */}
              {collapsed && group.label && gi > 0 && (
                <div className="my-1 h-px bg-slate-100" />
              )}

              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  collapsed={collapsed}
                  onClick={onNavClick}
                />
              ))}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom — user + logout */}
      <div className={cn(
        'border-t border-slate-200 flex-shrink-0',
        collapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3'
      )}>
        {!collapsed && (
          <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-admin-deep-forest text-xs font-bold text-white">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={handleLogout}
                className={cn(
                'flex items-center gap-3 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors',
                collapsed ? 'h-10 w-10 justify-center' : 'w-full px-3 py-2'
              )}>
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Logout</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Logout</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
