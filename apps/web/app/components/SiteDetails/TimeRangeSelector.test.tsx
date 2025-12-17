import { render, screen, fireEvent } from '@testing-library/react';
import { TimeRangeSelector, TimeRange } from './TimeRangeSelector';
import { describe, it, expect, vi } from 'vitest';

describe('TimeRangeSelector', () => {
  it('renders all time range options', () => {
    const mockOnChange = vi.fn();
    render(<TimeRangeSelector selected="24h" onChange={mockOnChange} />);

    expect(screen.getByText('24 Hours')).toBeInTheDocument();
    expect(screen.getByText('7 Days')).toBeInTheDocument();
    expect(screen.getByText('30 Days')).toBeInTheDocument();
  });

  it('highlights the selected option', () => {
    const mockOnChange = vi.fn();
    render(<TimeRangeSelector selected="7d" onChange={mockOnChange} />);

    const selectedButton = screen.getByText('7 Days');
    expect(selectedButton).toHaveClass('bg-blue-600');
    expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onChange when a different option is clicked', () => {
    const mockOnChange = vi.fn();
    render(<TimeRangeSelector selected="24h" onChange={mockOnChange} />);

    const sevenDaysButton = screen.getByText('7 Days');
    fireEvent.click(sevenDaysButton);

    expect(mockOnChange).toHaveBeenCalledWith('7d');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('updates selection state correctly', () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(
      <TimeRangeSelector selected="24h" onChange={mockOnChange} />
    );

    // Initially 24h is selected
    expect(screen.getByText('24 Hours')).toHaveClass('bg-blue-600');

    // Simulate selection change
    rerender(<TimeRangeSelector selected="30d" onChange={mockOnChange} />);

    // Now 30d should be selected
    expect(screen.getByText('30 Days')).toHaveClass('bg-blue-600');
    expect(screen.getByText('24 Hours')).not.toHaveClass('bg-blue-600');
  });

  it('has proper accessibility attributes', () => {
    const mockOnChange = vi.fn();
    render(<TimeRangeSelector selected="24h" onChange={mockOnChange} />);

    const group = screen.getByRole('group', { name: 'Time range selector' });
    expect(group).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-pressed');
    });
  });
});
