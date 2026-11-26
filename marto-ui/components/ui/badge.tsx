import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-primary/20 bg-primary/10 text-primary',
        secondary:
          'border-border-slate bg-surface-container-low text-on-surface-variant',
        destructive:
          'border-rose-200 bg-rose-50 text-rose-700',
        danger:
          'border-rose-200 bg-rose-50 text-rose-700',
        outline:
          'border-border-slate bg-surface-card text-on-surface',
        warning:
          'border-amber-200 bg-amber-50 text-amber-800',
        amber:
          'border-amber-200 bg-amber-50 text-amber-800',
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-700',
        info:
          'border-blue-200 bg-blue-50 text-blue-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
