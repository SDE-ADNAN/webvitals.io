import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FIDChart } from './FIDChart';

describe('FIDChart', () => {
  const mockData = [
    { timestamp: '2025-12-17T10:00:00Z', fid: 80 },
    { timestamp: '2025-12-17T11:00:00Z', fid: 150 },
    { timestamp: '2025-12-17T12:00:00Z', fid: 350 },
  ];

  it('renders chart with mock data', () => {
    const { container } = render(<FIDChart data={mockData} />);
    
    // Check that ResponsiveContainer is rendered
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders with 24h time range', () => {
    const { container } = render(<FIDChart data={mockData} timeRange="24h" />);
    
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders with 7d time range', () => {
    const { container } = render(<FIDChart data={mockData} timeRange="7d" />);
    
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders with 30d time range', () => {
    const { container } = render(<FIDChart data={mockData} timeRange="30d" />);
    
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const { container } = render(<FIDChart data={[]} />);
    
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});
