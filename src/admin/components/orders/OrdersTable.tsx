import type { Order, OrderStatus } from '../../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MoreHorizontal, Eye, Truck, CheckCircle2, Box } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { formatCurrency, formatDate } from '../../utils/format';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../constants';
import { Link } from 'react-router-dom';
import { cn } from '@admin/utils/cn';

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onUpdateStatus?: (id: string, status: OrderStatus) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  packed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  out_for_delivery: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-slate-100 text-slate-700 border-slate-200',
};

const paymentColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-slate-100 text-slate-700',
};

export function OrdersTable({ orders, isLoading, onUpdateStatus }: OrdersTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-deep-forest border-t-transparent mb-4" />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
          <Box className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">No orders found</h3>
        <p className="text-sm max-w-sm text-center">There are no orders matching your current filters.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-white">
        <TableRow className="border-b border-slate-200 hover:bg-transparent">
          <TableHead className="font-semibold text-slate-700">Order ID</TableHead>
          <TableHead className="font-semibold text-slate-700">Date</TableHead>
          <TableHead className="font-semibold text-slate-700">Customer</TableHead>
          <TableHead className="font-semibold text-slate-700">Total</TableHead>
          <TableHead className="font-semibold text-slate-700">Payment</TableHead>
          <TableHead className="font-semibold text-slate-700">Status</TableHead>
          <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id} className="group hover:bg-slate-50/50 transition-colors">
            <TableCell className="py-3">
              <Link to={`/admin/orders/${order.id}`} className="font-semibold text-admin-deep-forest hover:underline">
                {order.orderNumber}
              </Link>
            </TableCell>
            <TableCell className="py-3 text-sm text-slate-600">
              {formatDate(order.createdAt)}
            </TableCell>
            <TableCell className="py-3">
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">{order.customerName}</span>
                <span className="text-xs text-slate-500 mt-0.5">{order.customerPhone}</span>
              </div>
            </TableCell>
            <TableCell className="py-3 font-medium text-slate-900">
              {formatCurrency(order.total)}
            </TableCell>
            <TableCell className="py-3">
              <span className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                paymentColors[order.paymentStatus]
              )}>
                {PAYMENT_STATUSES[order.paymentStatus]}
              </span>
            </TableCell>
            <TableCell className="py-3">
              <Badge className={cn("hover:bg-transparent", statusColors[order.status])}>
                {ORDER_STATUSES[order.status]}
              </Badge>
            </TableCell>
            <TableCell className="py-3 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</DropdownMenuLabel>
                  <Link to={`/admin/orders/${order.id}`}>
                    <DropdownMenuItem className="cursor-pointer">
                      <Eye className="mr-2 h-4 w-4 text-slate-400" /> View Details
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  {order.status === 'pending' && onUpdateStatus && (
                    <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'confirmed')} className="cursor-pointer">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-blue-500" /> Mark Confirmed
                    </DropdownMenuItem>
                  )}
                  {order.status === 'packed' && onUpdateStatus && (
                    <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'out_for_delivery')} className="cursor-pointer">
                      <Truck className="mr-2 h-4 w-4 text-purple-500" /> Out for Delivery
                    </DropdownMenuItem>
                  )}
                  {order.status === 'out_for_delivery' && onUpdateStatus && (
                    <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'delivered')} className="cursor-pointer">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Mark Delivered
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
