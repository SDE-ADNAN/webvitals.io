'use client';

import React from 'react';
import { Button } from '../UI/Button';

export interface EmptyStateProps {
  onAddSite?: () => void;
}

/**
 * EmptyState component displays when no sites are configured
 * Provides guidance and a call-to-action to add the first site
 */
export function EmptyState({ onAddSite }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      {/* Illustration/Icon */}
      <div className="mb-6">
        <svg
          className="w-24 h-24 text-gray-400 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
        No sites configured
      </h2>

      {/* Descriptive text */}
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        Get started by adding your first website to monitor. Track Core Web Vitals
        and performance metrics to improve your user experience.
      </p>

      {/* Call-to-action button */}
      <Button
        variant="primary"
        size="lg"
        onClick={onAddSite}
        aria-label="Add your first site"
      >
        Add Your First Site
      </Button>
    </div>
  );
}
