'use client';

import React from 'react';
import Link from 'next/link';

export interface SiteHeaderProps {
  siteName: string;
  siteUrl: string;
}

export function SiteHeader({ siteName, siteUrl }: SiteHeaderProps) {
  return (
    <header className="mb-8">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
        aria-label="Back to dashboard"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Back to Dashboard</span>
      </Link>

      {/* Site name and URL */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {siteName}
        </h1>
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
          aria-label={`Visit ${siteName} (opens in new tab)`}
        >
          <span>{siteUrl}</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </header>
  );
}
