import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrdersStore } from '../../stores/orders.store';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatCurrency, formatDate } from '../../utils/format';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../constants';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders } = useOrdersStore();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const found = orders.find(o => o.id === id);
    if (found) setOrder(found);
  }, [id, orders]);

  if (!order) {
    return <div className="p-8 text-center text-admin-text-muted">Loading order details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')} className="flex-shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Order {order.orderNumber}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-initial bg-white"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
          <Button variant="outline" className="flex-1 sm:flex-initial bg-white"><Printer className="mr-2 h-4 w-4" /> Print Invoice</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-admin-border last:border-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-admin-surface-dim rounded-md flex items-center justify-center text-xs">Img</div>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-admin-text-muted">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.price)} x {item.quantity}</p>
                      <p className="text-sm font-semibold">{formatCurrency(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between text-admin-text-muted">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-admin-text-muted">
                  <span>Delivery Charge</span>
                  <span>{formatCurrency(order.deliveryCharge)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-admin-border">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-admin-text-muted">{order.customerEmail}</p>
                <p className="text-admin-text-muted">{order.customerPhone}</p>
              </div>
              <div>
                <p className="font-medium mb-1">Shipping Address</p>
                <p className="text-admin-text-muted">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p className="text-admin-text-muted">{order.shippingAddress.addressLine2}</p>}
                <p className="text-admin-text-muted">{order.shippingAddress.city}, {order.shippingAddress.district}</p>
                <p className="text-admin-text-muted">{order.shippingAddress.province}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-admin-text-muted">Payment</span>
                <span className="font-medium">{PAYMENT_STATUSES[order.paymentStatus as keyof typeof PAYMENT_STATUSES]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-admin-text-muted">Fulfillment</span>
                <span className="font-medium">{ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-admin-text-muted">Method</span>
                <span className="font-medium uppercase">{order.paymentMethod.replace(/_/g, ' ')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
