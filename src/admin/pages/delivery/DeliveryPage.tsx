import { Truck } from 'lucide-react';
import { ComingSoon } from '../../components/ui/ComingSoon';

export default function DeliveryPage() {
  return (
    <ComingSoon
      title="Delivery & Fulfillment"
      description="Track drivers in real-time, optimize delivery routes, and manage shipping zones. This feature is currently in development."
      icon={Truck}
    />
  );
}
