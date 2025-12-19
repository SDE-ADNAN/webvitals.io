import { render, screen } from '@testing-library/react';
import { MetricsGrid } from './MetricsGrid';
import { describe, it, expect } from 'vitest';

describe('MetricsGrid', () => {
  const mockMetrics = {
    lcp: { value: 2000, trend: 'down' as const, trendValue: 10 },
    fid: { value: 80, trend: 'stable' as const, trendValue: 0 },
    cls: { value: 0.05, trend: 'up' as const, trendValue: 5 },
  };

  it('renders all three metric cards', () => {
    render(<MetricsGrid {...mockMetrics} />);

    expect(screen.getByText('LCP')).toBeInTheDocument();
    expect(screen.getByText('FID')).toBeInTheDocument();
    expect(screen.getByText('CLS')).toBeInTheDocument();
  });

  it('passes LCP data to LCP card', () => {
    render(<MetricsGrid {...mockMetrics} />);

    expect(screen.getByText('2000')).toBeInTheDocument();
  });

  it('passes FID data to FID card', () => {
    render(<MetricsGrid {...mockMetrics} />);

    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('passes CLS data to CLS card', () => {
    render(<MetricsGrid {...mockMetrics} />);

    expect(screen.getByText('0.050')).toBeInTheDocument();
  });

  it('has responsive grid layout classes', () => {
    const { container } = render(<MetricsGrid {...mockMetrics} />);

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('has proper ARIA label', () => {
    render(<MetricsGrid {...mockMetrics} />);

    const region = screen.getByRole('region', { name: 'Core Web Vitals metrics' });
    expect(region).toBeInTheDocument();
  });
});
