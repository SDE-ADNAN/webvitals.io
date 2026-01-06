import React from 'react';
import { Badge } from '../UI/Badge';

export interface FilterBarProps {
  deviceType?: 'mobile' | 'desktop' | 'tablet' | 'all';
  browserName?: string;
  onDeviceTypeChange: (deviceType: 'mobile' | 'desktop' | 'tablet' | 'all') => void;
  onBrowserChange: (browser: string) => void;
  onClearFilters: () => void;
}

const deviceTypeOptions = [
  { value: 'all', label: 'All Devices' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'tablet', label: 'Tablet' },
] as const;

const browserOptions = [
  { value: 'all', label: 'All Browsers' },
  { value: 'Chrome', label: 'Chrome' },
  { value: 'Firefox', label: 'Firefox' },
  { value: 'Safari', label: 'Safari' },
  { value: 'Edge', label: 'Edge' },
] as const;

export function FilterBar({
  deviceType = 'all',
  browserName = 'all',
  onDeviceTypeChange,
  onBrowserChange,
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters = deviceType !== 'all' || browserName !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Device Type Filter */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="device-type-filter"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Device Type
        </label>
        <select
          id="device-type-filter"
          value={deviceType}
          onChange={(e) =>
            onDeviceTypeChange(
              e.target.value as 'mobile' | 'desktop' | 'tablet' | 'all'
            )
          }
          className="
            px-3 py-2 
            border border-gray-300 dark:border-gray-600 
            rounded-lg 
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            text-sm
          "
        >
          {deviceTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Browser Filter */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="browser-filter"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Browser
        </label>
        <select
          id="browser-filter"
          value={browserName}
          onChange={(e) => onBrowserChange(e.target.value)}
          className="
            px-3 py-2 
            border border-gray-300 dark:border-gray-600 
            rounded-lg 
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            text-sm
          "
        >
          {browserOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Active filters:
          </span>
          {deviceType !== 'all' && (
            <Badge variant="blue">
              Device:{' '}
              {deviceTypeOptions.find((opt) => opt.value === deviceType)?.label}
            </Badge>
          )}
          {browserName !== 'all' && (
            <Badge variant="blue">
              Browser:{' '}
              {browserOptions.find((opt) => opt.value === browserName)?.label}
            </Badge>
          )}
        </div>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="
            px-4 py-2 
            text-sm font-medium 
            text-gray-700 dark:text-gray-300 
            bg-white dark:bg-gray-800 
            border border-gray-300 dark:border-gray-600 
            rounded-lg 
            hover:bg-gray-50 dark:hover:bg-gray-700 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-colors duration-150
          "
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
