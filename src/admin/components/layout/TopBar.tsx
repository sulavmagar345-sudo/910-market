import { useState } from 'react';
import { Bell, Search, Menu, ChevronRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { cn } from '@admin/utils/cn';
import { useAdminAuthStore } from '../../stores/adminAuth.store';

interface TopBarProps {
  onMenuClick?: () => void;
  sidebarCollapsed?: boolean;
}

const notifications = [
  { id: '1', title: 'New Order', message: 'ORD-910-0124 — Sita Sharma (रू 4,500)', time: '2m ago', unread: true, type: 'order' },
  { id: '2', title: 'Low Stock Alert', message: '8848 Premium Vodka — only 5 left', time: '1h ago', unread: true, type: 'warning' },
  { id: '3', title: 'New Review', message: 'Ram Krishna rated Old Durbar ⭐⭐⭐⭐⭐', time: '2h ago', unread: true, type: 'review' },
  { id: '4', title: 'Payment Received', message: 'रू 12,600 via eSewa — ORD-910-0121', time: '8h ago', unread: false, type: 'payment' },
];

// Build breadcrumb from pathname
function useBreadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.replace('/admin', '').split('/').filter(Boolean);
  return parts.map((part, i) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
    href: '/admin/' + parts.slice(0, i + 1).join('/'),
    isLast: i === parts.length - 1,
  }));
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const breadcrumbs = useBreadcrumbs();
  const unreadCount = notifications.filter(n => n.unread).length;
  const { adminUser, logoutAdmin } = useAdminAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex h-14 items-center border-b border-slate-200 bg-white px-4 gap-4 flex-shrink-0">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-9 w-9 text-slate-500"
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0 flex-1">
        <Link to="/admin" className="text-slate-400 hover:text-slate-700 transition-colors font-medium flex-shrink-0">
          Dashboard
        </Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
            {crumb.isLast ? (
              <span className="font-semibold text-slate-800 truncate">{crumb.label}</span>
            ) : (
              <Link to={crumb.href} className="text-slate-400 hover:text-slate-700 transition-colors truncate">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Spacer for mobile */}
      <div className="flex-1 md:hidden" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-sm hover:border-slate-300 hover:bg-slate-100 transition-all group">
          <Search className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Search...</span>
          <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 group-hover:border-slate-300">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end" forceMount>
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-medium text-slate-500">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'flex items-start gap-3 px-3 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors',
                    notif.unread && 'bg-blue-50/30'
                  )}
                >
                  <div className={cn(
                    'mt-0.5 h-2 w-2 rounded-full flex-shrink-0',
                    notif.unread ? 'bg-blue-500' : 'bg-transparent'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{notif.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-3 py-2 border-t border-slate-100">
              <button className="text-xs font-medium text-admin-deep-forest hover:underline w-full text-center">
                View all notifications
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2 rounded-lg hover:bg-slate-100">
              <Avatar className="h-7 w-7">
                <AvatarImage src="" alt={adminUser?.name || 'Admin'} />
                <AvatarFallback className="bg-admin-deep-forest text-white text-xs font-bold">
                  {adminUser ? getInitials(adminUser.name) : 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-xs font-semibold text-slate-800 leading-none">{adminUser?.name || 'Admin'}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{adminUser?.email || ''}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-slate-900">{adminUser?.name || 'Admin'}</p>
                <p className="text-xs leading-none text-slate-500">{adminUser?.email || ''}</p>
                <p className="text-[10px] leading-none text-admin-deep-forest mt-1 font-medium uppercase">{adminUser?.role || ''}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/settings">Profile Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              onClick={handleLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
