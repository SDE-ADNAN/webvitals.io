import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from './FilterBar';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('FilterBar', () => {
  const mockOnDeviceTypeChange = vi.fn();
  const mockOnBrowserChange = vi.fn();
  const mockOnClearFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders device type and browser dropdowns', () => {
    render(
      <FilterBar
        deviceType="all"
        browserName="all"
        onDeviceTypeChange={mockOnDeviceTypeChange}
        onBrowserChange={mockOnBrowserChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByLabelText('Device Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Browser')).toBeInTheDocument();
  });

  it('calls onDeviceTypeChange when device type is selected', () => {
    render(
      <FilterBar
        deviceType="all"
        browserName="all"
        onDeviceTypeChange={mockOnDeviceTypeChange}
        onBrowserChange={mockOnBrowserChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const deviceSelect = screen.getByLabelText('Device Type');
    fireEvent.change(deviceSelect, { target: { value: 'mobile' } });

    expect(mockOnDeviceTypeChange).toHaveBeenCalledWith('mobile');
    expect(mockOnDeviceTypeChange).toHaveBeenCalledTimes(1);
  });

  it('calls onBrowserChange when browser is selected', () => {
    render(
      <FilterBar
        deviceType="all"
        browserName="all"
        onDeviceTypeChange={mockOnDeviceTypeChange}
        onBrowserChange={mockOnBrowserChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const browserSelect = screen.getByLabelText('Browser');
    fireEvent.change(browserSelect, { target: { value: 'Chrome' } });

    expect(mockOnBrowserChange).toHaveBeenCalledWith('Chrome');
    expect(mockOnBrowserChange).toHaveBeenCalledTimes(1);
  });

  it('displays active filter badges when filters are applied', () => {
    render(
      <FilterBar
        deviceType="mobile"
        browserName="Chrome"
        onDeviceTypeChange={mockOnDeviceTypeChange}
        onBrowserChange={mockOnBrowserChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByText('Active filters:')).toBeInTheDocument();
    expect(screen.getByText(/Device: Mobile/)).toBeInTheDocument();
    expect(screen.getByText(/Browser: Chrome/)).toBeInTheDocument();
  });

  it('does not display active filters when no filters are applied', () => {
    render(
      <FilterBar
        deviceType="all"
        browserName="all"
        onDeviceTypeChange={mockOnDeviceTypeChange}
        onBrowserChange={mockOnBrowserChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.queryByText('Active filters:')).not.toBeInTheDocument();
  });

  it('displays Clear Filters button when filters are active', () => {
    render(
      <FilterBar
        deviceType="mobile"
        browserName="all"
        onDeviceTypeChange={mockOnDeviceTypeChange}
        onBrowserChange={mockOnBrowserChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const clearButton = screen.getByText('Clear Filters');
    expect(clearButton).toBeInTheDocument();
  });

  it('does not display Clear Filters button when no filters are active', () => {
    render(
      <FilterBar
        deviceType="all"
        browserName="all"
        onDeviceTypeChange={mockOnDeviceTypeChange}
        onBrowserChange={mockOnBrowserChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
  });

  it('calls onClearFilters when Clear Filters button is clicked', () => {
    render(
      <FilterBar
        deviceType="mobile"
        browserName="Chrome"
        onDeviceTypeChange={mockOnDeviceTypeChange}
        onBrowserChange={mockOnBrowserChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
  });

  it('updates filter state correctly', () => {
    const { rerender } = render(
      <FilterBar
        deviceType="all"
        browserName="all"
        onDeviceTypeChange={mockOnDeviceTypeChange}
        onBrowserChange={mockOnBrowserChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    // Initially no filters
    expect(screen.queryByText('Active filters:')).not.toBeInTheDocument();

    // Apply device filter
    rerender(
      <FilterBar
        deviceType="tablet"
        browserName="all"
        onDeviceTypeChange={mockOnDeviceTypeChange}
        onBrowserChange={mockOnBrowserChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByText('Active filters:')).toBeInTheDocument();
    expect(screen.getByText(/Device: Tablet/)).toBeInTheDocument();
  });
});
