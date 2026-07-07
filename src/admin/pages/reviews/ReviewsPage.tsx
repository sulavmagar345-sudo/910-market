import { MessageSquare } from 'lucide-react';
import { ComingSoon } from '../../components/ui/ComingSoon';

export default function ReviewsPage() {
  return (
    <ComingSoon
      title="Customer Reviews"
      description="Moderate product reviews, reply to customer feedback, and manage your store's reputation. This feature is currently in development."
      icon={MessageSquare}
    />
  );
}
