import { render, screen } from '@testing-library/react';
import { MetricCard } from './MetricCard';
import { describe, it, expect } from 'vitest';

describe('MetricCard', () => {
  describe('Metric name and value display', () => {
    it('renders LCP metric name and value', () => {
      render(<MetricCard metricName="LCP" value={2000} />);

      expect(screen.getByText('LCP')).toBeInTheDocument();
      expect(screen.getByText('Largest Contentful Paint')).toBeInTheDocument();
      expect(screen.getByText('2000')).toBeInTheDocument();
      expect(screen.getByText('ms')).toBeInTheDocument();
    });

    it('renders FID metric name and value', () => {
      render(<MetricCard metricName="FID" value={80} />);

      expect(screen.getByText('FID')).toBeInTheDocument();
      expect(screen.getByText('First Input Delay')).toBeInTheDocument();
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('ms')).toBeInTheDocument();
    });

    it('renders CLS metric name and value with correct precision', () => {
      render(<MetricCard metricName="CLS" value={0.05} />);

      expect(screen.getByText('CLS')).toBeInTheDocument();
      expect(screen.getByText('Cumulative Layout Shift')).toBeInTheDocument();
      expect(screen.getByText('0.050')).toBeInTheDocument();
    });
  });

  describe('Status badge color for different thresholds', () => {
    it('displays green badge for good LCP value', () => {
      render(<MetricCard metricName="LCP" value={2000} />);

      const badge = screen.getByText('Good');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass('bg-green-100');
    });

    it('displays yellow badge for needs-improvement LCP value', () => {
      render(<MetricCard metricName="LCP" value={3000} />);

      const badge = screen.getByText('Needs Improvement');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass('bg-yellow-100');
    });

    it('displays red badge for poor LCP value', () => {
      render(<MetricCard metricName="LCP" value={5000} />);

      const badge = screen.getByText('Poor');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass('bg-red-100');
    });

    it('displays green badge for good FID value', () => {
      render(<MetricCard metricName="FID" value={80} />);

      const badge = screen.getByText('Good');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass('bg-green-100');
    });

    it('displays yellow badge for needs-improvement FID value', () => {
      render(<MetricCard metricName="FID" value={200} />);

      const badge = screen.getByText('Needs Improvement');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass('bg-yellow-100');
    });

    it('displays red badge for poor FID value', () => {
      render(<MetricCard metricName="FID" value={400} />);

      const badge = screen.getByText('Poor');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass('bg-red-100');
    });

    it('displays green badge for good CLS value', () => {
      render(<MetricCard metricName="CLS" value={0.05} />);

      const badge = screen.getByText('Good');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass('bg-green-100');
    });

    it('displays yellow badge for needs-improvement CLS value', () => {
      render(<MetricCard metricName="CLS" value={0.15} />);

      const badge = screen.getByText('Needs Improvement');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass('bg-yellow-100');
    });

    it('displays red badge for poor CLS value', () => {
      render(<MetricCard metricName="CLS" value={0.3} />);

      const badge = screen.getByText('Poor');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass('bg-red-100');
    });
  });

  describe('Trend indicator display', () => {
    it('displays upward trend with red color and percentage', () => {
      render(<MetricCard metricName="LCP" value={3000} trend="up" trendValue={15.5} />);

      expect(screen.getByText('15.5%')).toBeInTheDocument();
      const trendElement = screen.getByText('15.5%');
      expect(trendElement).toHaveClass('text-red-600');
    });

    it('displays downward trend with green color and percentage', () => {
      render(<MetricCard metricName="LCP" value={2000} trend="down" trendValue={10.2} />);

      expect(screen.getByText('10.2%')).toBeInTheDocument();
      const trendElement = screen.getByText('10.2%');
      expect(trendElement).toHaveClass('text-green-600');
    });

    it('does not display trend indicator when trend is stable', () => {
      render(<MetricCard metricName="LCP" value={2000} trend="stable" trendValue={0} />);

      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });

    it('does not display trend indicator when trend is not provided', () => {
      render(<MetricCard metricName="LCP" value={2000} />);

      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });
  });

  describe('Threshold information display', () => {
    it('displays correct threshold information for LCP', () => {
      render(<MetricCard metricName="LCP" value={2000} />);

      expect(screen.getByText('≤ 2500ms')).toBeInTheDocument();
      expect(screen.getByText('2501-4000ms')).toBeInTheDocument();
      expect(screen.getByText('> 4000ms')).toBeInTheDocument();
    });

    it('displays correct threshold information for FID', () => {
      render(<MetricCard metricName="FID" value={80} />);

      expect(screen.getByText('≤ 100ms')).toBeInTheDocument();
      expect(screen.getByText('101-300ms')).toBeInTheDocument();
      expect(screen.getByText('> 300ms')).toBeInTheDocument();
    });

    it('displays correct threshold information for CLS', () => {
      render(<MetricCard metricName="CLS" value={0.05} />);

      expect(screen.getByText('≤ 0.1')).toBeInTheDocument();
      expect(screen.getByText('0.11-0.25')).toBeInTheDocument();
      expect(screen.getByText('> 0.25')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<MetricCard metricName="LCP" value={2000} />);

      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-labelledby', 'metric-lcp-name');
    });

    it('includes screen reader text for status', () => {
      render(<MetricCard metricName="LCP" value={2000} />);

      expect(screen.getByText('Status:', { exact: false })).toHaveClass('sr-only');
    });

    it('includes screen reader text for trend direction', () => {
      render(<MetricCard metricName="LCP" value={2000} trend="down" trendValue={10} />);

      expect(screen.getByText('decrease')).toHaveClass('sr-only');
    });
  });
});
