import { render, screen } from '@testing-library/react';
import { SiteHeader } from './SiteHeader';
import { describe, it, expect } from 'vitest';

describe('SiteHeader', () => {
  const mockProps = {
    siteName: 'My Portfolio',
    siteUrl: 'https://myportfolio.com',
  };

  it('renders site name as h1', () => {
    render(<SiteHeader {...mockProps} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('My Portfolio');
  });

  it('renders site URL as a link', () => {
    render(<SiteHeader {...mockProps} />);

    const link = screen.getByRole('link', { name: /Visit My Portfolio/i });
    expect(link).toHaveAttribute('href', 'https://myportfolio.com');
    expect(link).toHaveTextContent('https://myportfolio.com');
  });

  it('opens site URL in new tab', () => {
    render(<SiteHeader {...mockProps} />);

    const link = screen.getByRole('link', { name: /Visit My Portfolio/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders back button to dashboard', () => {
    render(<SiteHeader {...mockProps} />);

    const backLink = screen.getByRole('link', { name: 'Back to dashboard' });
    expect(backLink).toHaveAttribute('href', '/dashboard');
    expect(backLink).toHaveTextContent('Back to Dashboard');
  });

  it('has proper accessibility attributes', () => {
    render(<SiteHeader {...mockProps} />);

    const backLink = screen.getByRole('link', { name: 'Back to dashboard' });
    expect(backLink).toHaveAttribute('aria-label', 'Back to dashboard');

    const siteLink = screen.getByRole('link', { name: /Visit My Portfolio/i });
    expect(siteLink).toHaveAttribute('aria-label', 'Visit My Portfolio (opens in new tab)');
  });

  it('renders within a header element', () => {
    const { container } = render(<SiteHeader {...mockProps} />);

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });
});
