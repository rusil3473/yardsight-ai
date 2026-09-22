import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  pulse = false,
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-tight border leading-tight';

  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
    info: 'bg-sky-500/10 text-sky-700 dark:text-cyan-300 border-sky-500/30',
    outline: 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
  };

  return (
    <span className={`${base} ${variantStyles[variant]} ${className}`} {...props}>
      {pulse && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shrink-0" />
      )}
      {children}
    </span>
  );
};
