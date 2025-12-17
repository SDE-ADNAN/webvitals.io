import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LCPChart } from './LCPChart';
import { FIDChart } from './FIDChart';
import { CLSChart } from './CLSChart';

describe('Chart Accessibility', () => {
  const mockLcpData = [
    { timestamp: '2025-12-17T10:00:00Z', lcp: 2000 },
    { timestamp: '2025-12-17T11:00:00Z', lcp: 3000 },
    { timestamp: '2025-12-17T12:00:00Z', lcp: 4500 },
  ];

  const mockFidData = [
    { timestamp: '2025-12-17T10:00:00Z', fid: 80 },
    { timestamp: '2025-12-17T11:00:00Z', fid: 150 },
    { timestamp: '2025-12-17T12:00:00Z', fid: 350 },
  ];

  const mockClsData = [
    { timestamp: '2025-12-17T10:00:00Z', cls: 0.05 },
    { timestamp: '2025-12-17T11:00:00Z', cls: 0.15 },
    { timestamp: '2025-12-17T12:00:00Z', cls: 0.3 },
  ];

  describe('LCPChart', () => {
    it('has role="img" attribute', () => {
      const { container } = render(<LCPChart data={mockLcpData} />);
      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toBeInTheDocument();
    });

    it('has descriptive aria-label', () => {
      const { container } = render(<LCPChart data={mockLcpData} />);
      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toHaveAttribute('aria-label');
      const ariaLabel = chartContainer?.getAttribute('aria-label');
      expect(ariaLabel).toContain('Line chart');
      expect(ariaLabel).toContain('LCP');
    });

    it('includes sr-only text with summary statistics', () => {
      render(<LCPChart data={mockLcpData} />);
      const srOnlyText = screen.getByText(/Line chart displaying Largest Contentful Paint/);
      expect(srOnlyText).toHaveClass('sr-only');
    });

    it('mentions thresholds in sr-only text', () => {
      render(<LCPChart data={mockLcpData} />);
      const srOnlyText = screen.getByText(/Good threshold is 2500ms, poor threshold is 4000ms/);
      expect(srOnlyText).toBeInTheDocument();
    });
  });

  describe('FIDChart', () => {
    it('has role="img" attribute', () => {
      const { container } = render(<FIDChart data={mockFidData} />);
      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toBeInTheDocument();
    });

    it('has descriptive aria-label', () => {
      const { container } = render(<FIDChart data={mockFidData} />);
      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toHaveAttribute('aria-label');
      const ariaLabel = chartContainer?.getAttribute('aria-label');
      expect(ariaLabel).toContain('Bar chart');
      expect(ariaLabel).toContain('FID');
    });

    it('includes sr-only text with summary statistics', () => {
      render(<FIDChart data={mockFidData} />);
      const srOnlyText = screen.getByText(/Bar chart displaying First Input Delay/);
      expect(srOnlyText).toHaveClass('sr-only');
    });

    it('mentions thresholds in sr-only text', () => {
      render(<FIDChart data={mockFidData} />);
      const srOnlyText = screen.getByText(/Good threshold is 100ms, poor threshold is 300ms/);
      expect(srOnlyText).toBeInTheDocument();
    });
  });

  describe('CLSChart', () => {
    it('has role="img" attribute', () => {
      const { container } = render(<CLSChart data={mockClsData} />);
      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toBeInTheDocument();
    });

    it('has descriptive aria-label', () => {
      const { container } = render(<CLSChart data={mockClsData} />);
      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toHaveAttribute('aria-label');
      const ariaLabel = chartContainer?.getAttribute('aria-label');
      expect(ariaLabel).toContain('Area chart');
      expect(ariaLabel).toContain('CLS');
    });

    it('includes sr-only text with summary statistics', () => {
      render(<CLSChart data={mockClsData} />);
      const srOnlyText = screen.getByText(/Area chart displaying Cumulative Layout Shift/);
      expect(srOnlyText).toHaveClass('sr-only');
    });

    it('mentions thresholds in sr-only text', () => {
      render(<CLSChart data={mockClsData} />);
      const srOnlyText = screen.getByText(/Good threshold is 0.1, poor threshold is 0.25/);
      expect(srOnlyText).toBeInTheDocument();
    });
  });
});
