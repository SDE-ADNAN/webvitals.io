import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  onClick?: () => void;
  hover?: boolean;
  as?: 'div' | 'article';
}

export function Card({
  children,
  onClick,
  hover = false,
  as: Component = 'div',
  className = '',
  ...props
}: CardProps) {
  const isClickable = !!onClick;

  return (
    <Component
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 
        rounded-lg 
        shadow-sm 
        border border-gray-200 dark:border-gray-700
        p-6
        transition-all duration-200
        ${hover || isClickable ? 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600' : ''}
        ${isClickable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : ''}
        ${className}
      `}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </Component>
  );
}
