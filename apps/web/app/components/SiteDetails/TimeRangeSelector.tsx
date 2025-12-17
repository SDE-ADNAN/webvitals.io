import React from 'react';

export type TimeRange = '24h' | '7d' | '30d';

export interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (timeRange: TimeRange) => void;
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

export function TimeRangeSelector({
  selected,
  onChange,
}: TimeRangeSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Time range selector"
      className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
    >
      {timeRangeOptions.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isSelected}
            className={`
              px-4 py-2 text-sm font-medium
              first:rounded-l-lg last:rounded-r-lg
              border-r border-gray-300 dark:border-gray-600 last:border-r-0
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${
                isSelected
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
