import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Badge text</Badge>);
    expect(screen.getByText('Badge text')).toBeInTheDocument();
  });

  it('renders with default gray variant', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('renders all color variants', () => {
    const { rerender, container } = render(<Badge variant="green">Green</Badge>);
    let badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');

    rerender(<Badge variant="yellow">Yellow</Badge>);
    badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');

    rerender(<Badge variant="red">Red</Badge>);
    badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');

    rerender(<Badge variant="blue">Blue</Badge>);
    badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');

    rerender(<Badge variant="gray">Gray</Badge>);
    badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('renders with icon', () => {
    const icon = <span data-testid="test-icon">✓</span>;
    render(<Badge icon={icon}>With icon</Badge>);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('With icon')).toBeInTheDocument();
  });

  it('icon has aria-hidden attribute', () => {
    const icon = <span>✓</span>;
    const { container } = render(<Badge icon={icon}>With icon</Badge>);
    const iconWrapper = container.querySelector('[aria-hidden="true"]');
    expect(iconWrapper).toBeInTheDocument();
  });
});
