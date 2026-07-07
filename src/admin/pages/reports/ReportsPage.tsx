import { FileText } from 'lucide-react';
import { ComingSoon } from '../../components/ui/ComingSoon';

export default function ReportsPage() {
  return (
    <ComingSoon
      title="Custom Reports"
      description="Generate, schedule, and export custom CSV/PDF reports for sales, inventory, and taxes. This feature is currently in development."
      icon={FileText}
    />
  );
}
