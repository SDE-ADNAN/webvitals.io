import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CLSChart } from './CLSChart';

describe('CLSChart', () => {
  const mockData = [
    { timestamp: '2025-12-17T10:00:00Z', cls: 0.05 },
    { timestamp: '2025-12-17T11:00:00Z', cls: 0.15 },
    { timestamp: '2025-12-17T12:00:00Z', cls: 0.3 },
  ];

  it('renders chart with mock data', () => {
    const { container } = render(<CLSChart data={mockData} />);
    
    // Check that ResponsiveContainer is rendered
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders with 24h time range', () => {
    const { container } = render(<CLSChart data={mockData} timeRange="24h" />);
    
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders with 7d time range', () => {
    const { container } = render(<CLSChart data={mockData} timeRange="7d" />);
    
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders with 30d time range', () => {
    const { container } = render(<CLSChart data={mockData} timeRange="30d" />);
    
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const { container } = render(<CLSChart data={[]} />);
    
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});
