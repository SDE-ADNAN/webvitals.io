import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { SiteCard } from './SiteCard';
import type { Site } from '@webvitals/types';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('SiteCard', () => {
  const mockPush = vi.fn();
  const mockSite: Site & { lastMetric?: { lcp: number; fid: number; cls: number } } = {
    id: 1,
    userId: 1,
    name: 'Test Site',
    url: 'https://test.com',
    domain: 'test.com',
    siteId: 'site_123',
    isActive: true,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-14T00:00:00Z',
    lastMetric: {
      lcp: 2000,
      fid: 80,
      cls: 0.05,
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useRouter } = await import('next/navigation');
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  it('renders site name correctly', () => {
    render(<SiteCard site={mockSite} />);
    expect(screen.getByText('Test Site')).toBeInTheDocument();
  });

  it('renders site URL correctly', () => {
    render(<SiteCard site={mockSite} />);
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
  });

  it('renders site ID correctly', () => {
    render(<SiteCard site={mockSite} />);
    expect(screen.getByText(/ID: site_123/)).toBeInTheDocument();
  });

  it('displays LCP metric badge with correct value', () => {
    render(<SiteCard site={mockSite} />);
    expect(screen.getByText(/LCP:/)).toBeInTheDocument();
    expect(screen.getByText(/2000ms/)).toBeInTheDocument();
  });

  it('displays FID metric badge with correct value', () => {
    render(<SiteCard site={mockSite} />);
    expect(screen.getByText(/FID:/)).toBeInTheDocument();
    expect(screen.getByText(/80ms/)).toBeInTheDocument();
  });

  it('displays CLS metric badge with correct value', () => {
    render(<SiteCard site={mockSite} />);
    expect(screen.getByText(/CLS:/)).toBeInTheDocument();
    expect(screen.getByText(/0.050/)).toBeInTheDocument();
  });

  it('displays metric badges with correct colors for good values', () => {
    render(<SiteCard site={mockSite} />);
    
    // All metrics should have green badges (good status)
    const badges = screen.getAllByRole('generic', { hidden: true });
    const greenBadges = badges.filter(badge => 
      badge.className.includes('bg-green')
    );
    
    // Should have at least 3 green badges (LCP, FID, CLS)
    expect(greenBadges.length).toBeGreaterThanOrEqual(3);
  });

  it('displays metric badges with yellow color for needs-improvement values', () => {
    const siteWithYellowMetrics = {
      ...mockSite,
      lastMetric: {
        lcp: 3000, // needs-improvement (2500-4000)
        fid: 150,  // needs-improvement (100-300)
        cls: 0.15, // needs-improvement (0.1-0.25)
      },
    };

    render(<SiteCard site={siteWithYellowMetrics} />);
    
    const badges = screen.getAllByRole('generic', { hidden: true });
    const yellowBadges = badges.filter(badge => 
      badge.className.includes('bg-yellow')
    );
    
    // Should have at least 3 yellow badges
    expect(yellowBadges.length).toBeGreaterThanOrEqual(3);
  });

  it('displays metric badges with red color for poor values', () => {
    const siteWithRedMetrics = {
      ...mockSite,
      lastMetric: {
        lcp: 5000, // poor (> 4000)
        fid: 400,  // poor (> 300)
        cls: 0.3,  // poor (> 0.25)
      },
    };

    render(<SiteCard site={siteWithRedMetrics} />);
    
    const badges = screen.getAllByRole('generic', { hidden: true });
    const redBadges = badges.filter(badge => 
      badge.className.includes('bg-red')
    );
    
    // Should have at least 3 red badges
    expect(redBadges.length).toBeGreaterThanOrEqual(3);
  });

  it('calls onClick handler when provided', () => {
    const handleClick = vi.fn();
    render(<SiteCard site={mockSite} onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('navigates to site details page when clicked without onClick prop', () => {
    render(<SiteCard site={mockSite} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(mockPush).toHaveBeenCalledWith('/dashboard/site_123');
  });

  it('has proper ARIA labels for accessibility', () => {
    render(<SiteCard site={mockSite} />);
    
    // Check for button role (Card component renders as button when onClick is present)
    const card = screen.getByRole('button');
    expect(card).toBeInTheDocument();
    
    // Check for labelledby attribute
    expect(card).toHaveAttribute('aria-labelledby', 'site-name-1');
    
    // Check for describedby attribute
    expect(card).toHaveAttribute('aria-describedby', 'site-url-1');
    
    // Check for metrics group label
    const metricsGroup = screen.getByRole('group', { name: /Core Web Vitals metrics/i });
    expect(metricsGroup).toBeInTheDocument();
  });

  it('displays "No metrics available" when lastMetric is undefined', () => {
    const siteWithoutMetrics = {
      ...mockSite,
      lastMetric: undefined,
    };

    render(<SiteCard site={siteWithoutMetrics} />);
    
    expect(screen.getByText(/No metrics available yet/i)).toBeInTheDocument();
  });

  it('is keyboard accessible', () => {
    render(<SiteCard site={mockSite} />);
    
    const card = screen.getByRole('button');
    
    // Simulate Enter key press
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    expect(mockPush).toHaveBeenCalledWith('/dashboard/site_123');
    
    mockPush.mockClear();
    
    // Simulate Space key press
    fireEvent.keyDown(card, { key: ' ', code: 'Space' });
    expect(mockPush).toHaveBeenCalledWith('/dashboard/site_123');
  });

  it('includes screen reader text for metric status', () => {
    render(<SiteCard site={mockSite} />);
    
    // Check for screen reader only status text
    const srOnlyElements = document.querySelectorAll('.sr-only');
    const statusTexts = Array.from(srOnlyElements).map(el => el.textContent);
    
    // Should have status text for each metric
    expect(statusTexts.some(text => text?.includes('Status: Good'))).toBe(true);
  });
});
