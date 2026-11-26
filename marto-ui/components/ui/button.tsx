import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-primary-container text-on-primary shadow-[var(--shadow-level-1)] hover:bg-primary hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]',
        pill:
          'rounded-full bg-primary-container text-on-primary shadow-[var(--shadow-level-1)] hover:bg-primary hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]',
        destructive:
          'bg-error text-on-error shadow-[var(--shadow-level-1)] hover:bg-status-danger active:scale-[0.99]',
        'destructive-outline':
          'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-[0.99]',
        outline:
          'border border-border-slate bg-surface-card text-on-surface hover:bg-surface-page active:scale-[0.99]',
        secondary:
          'bg-surface-container-low text-on-surface border border-border-slate hover:bg-surface-container active:scale-[0.99]',
        ghost:
          'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
        link:
          'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-6 text-sm',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
