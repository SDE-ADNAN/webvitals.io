import React, { HTMLAttributes } from 'react';

export type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  yellow:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export function Badge({
  children,
  variant = 'gray',
  icon,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2.5 py-0.5 
        rounded-full 
        text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="inline-flex" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
