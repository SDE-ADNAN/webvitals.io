import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChartContainer } from './ChartContainer';

describe('ChartContainer', () => {
  it('renders title correctly', () => {
    render(
      <ChartContainer title="Test Chart">
        <div>Chart content</div>
      </ChartContainer>
    );
    
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <ChartContainer title="Test Chart" description="Test description">
        <div>Chart content</div>
      </ChartContainer>
    );
    
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <ChartContainer title="Test Chart">
        <div data-testid="chart-content">Chart content</div>
      </ChartContainer>
    );
    
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(
      <ChartContainer title="Test Chart">
        <div>Chart content</div>
      </ChartContainer>
    );
    
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });
});
