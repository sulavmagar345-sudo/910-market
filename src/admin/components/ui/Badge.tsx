import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@admin/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-admin-deep-forest focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-admin-deep-forest text-white hover:bg-admin-deep-forest/80',
        secondary: 'border-transparent bg-admin-slate-gray text-white hover:bg-admin-slate-gray/80',
        destructive: 'border-transparent bg-admin-danger text-white hover:bg-admin-danger/80',
        success: 'border-transparent bg-admin-success text-white hover:bg-admin-success/80',
        warning: 'border-transparent bg-admin-warning text-white hover:bg-admin-warning/80',
        outline: 'text-admin-text border-admin-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
