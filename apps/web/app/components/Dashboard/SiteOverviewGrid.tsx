'use client';

import React from 'react';
import { SiteCard } from './SiteCard';
import type { Site } from '@webvitals/types';

export interface SiteOverviewGridProps {
  sites: Array<Site & {
    lastMetric?: {
      lcp: number;
      fid: number;
      cls: number;
    };
  }>;
}

/**
 * SiteOverviewGrid component displays a responsive grid of site cards
 * - 1 column on mobile (< 768px)
 * - 2 columns on tablet (768px - 1024px)
 * - 3 columns on desktop (> 1024px)
 */
export function SiteOverviewGrid({ sites }: SiteOverviewGridProps) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      role="list"
      aria-label="Monitored sites"
    >
      {sites.map((site) => (
        <div key={site.id} role="listitem">
          <SiteCard site={site} />
        </div>
      ))}
    </div>
  );
}
