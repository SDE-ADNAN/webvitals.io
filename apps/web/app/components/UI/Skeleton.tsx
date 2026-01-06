/**
 * Skeleton loading components
 * 
 * These components provide visual feedback while data is loading,
 * matching the expected content layout to prevent layout shift.
 * 
 * Uses Tailwind's animate-pulse utility for the loading effect.
 */

/**
 * CardSkeleton - Loading placeholder for card components
 * 
 * Used for: SiteCard, MetricCard, and other card-based layouts
 */
export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg p-6">
      {/* Title placeholder */}
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
      
      {/* Subtitle placeholder */}
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-6"></div>
      
      {/* Badges/metrics placeholder */}
      <div className="flex gap-2">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
      </div>
    </div>
  );
}

/**
 * ChartSkeleton - Loading placeholder for chart components
 * 
 * Used for: LCPChart, FIDChart, CLSChart, and other visualizations
 */
export function ChartSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg p-6">
      {/* Chart title placeholder */}
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
      
      {/* Chart area placeholder */}
      <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
  );
}

/**
 * TableSkeleton - Loading placeholder for table components
 * 
 * Used for: Data tables, lists, and other tabular layouts
 * 
 * @param rows - Number of skeleton rows to display (default: 5)
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * GridSkeleton - Loading placeholder for grid layouts
 * 
 * Used for: Dashboard site grid and other grid-based layouts
 * 
 * @param items - Number of skeleton items to display (default: 6)
 * @param columns - Number of columns in the grid (default: 3)
 */
export function GridSkeleton({ 
  items = 6, 
  columns = 3 
}: { 
  items?: number; 
  columns?: number;
}) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * TextSkeleton - Loading placeholder for text content
 * 
 * Used for: Headings, paragraphs, and other text elements
 * 
 * @param lines - Number of text lines to display (default: 3)
 * @param width - Width variant for the lines (default: 'full')
 */
export function TextSkeleton({ 
  lines = 3,
  width = "full" 
}: { 
  lines?: number;
  width?: "full" | "3/4" | "1/2" | "1/4";
}) {
  const widthClass = {
    full: "w-full",
    "3/4": "w-3/4",
    "1/2": "w-1/2",
    "1/4": "w-1/4",
  }[width];

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${
            i === lines - 1 ? "w-2/3" : widthClass
          }`}
        ></div>
      ))}
    </div>
  );
}

/**
 * MetricCardSkeleton - Specialized skeleton for metric cards
 * 
 * Used for: MetricCard components showing LCP, FID, CLS values
 */
export function MetricCardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg p-6">
      {/* Metric name */}
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-3"></div>
      
      {/* Metric value */}
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
      
      {/* Status badge */}
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
    </div>
  );
}
