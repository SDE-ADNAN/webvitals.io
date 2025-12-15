'use client';

import React, { useState } from 'react';
import { useSites } from '@/lib/react-query/queries/useSites';
import { SiteOverviewGrid } from '../components/Dashboard/SiteOverviewGrid';
import { EmptyState } from '../components/Dashboard/EmptyState';
import { AddSiteModal } from '../components/Dashboard/AddSiteModal';
import { Button } from '../components/UI/Button';
import { GridSkeleton } from '../components/UI/Skeleton';
import type { SiteFormData } from '@/lib/validations/schemas';

export default function DashboardPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: sites, isLoading, error } = useSites();

  const handleAddSite = async (data: SiteFormData) => {
    // Mock implementation for Week 1
    // Week 3: Will call API to create site
    console.log('Adding site:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In Week 3, this will trigger a refetch of sites
    alert(`Site "${data.name}" added successfully!`);
  };

  const handleOpenModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  return (
    <div id="main-content">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor Core Web Vitals and performance metrics for all your sites
          </p>
        </div>
        
        {/* Add New Site Button - Only show when sites exist */}
        {sites && sites.length > 0 && (
          <Button
            variant="primary"
            onClick={handleOpenModal}
            aria-label="Add new site"
          >
            Add New Site
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <GridSkeleton items={3} columns={3} />
      )}

      {/* Error State */}
      {error && (
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          role="alert"
        >
          <p className="text-red-800 dark:text-red-200">
            Error loading sites: {error.message}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && sites && sites.length === 0 && (
        <EmptyState onAddSite={handleOpenModal} />
      )}

      {/* Sites Grid */}
      {!isLoading && !error && sites && sites.length > 0 && (
        <SiteOverviewGrid sites={sites} />
      )}

      {/* Add Site Modal */}
      <AddSiteModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddSite}
      />
    </div>
  );
}
