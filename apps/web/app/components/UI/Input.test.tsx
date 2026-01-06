import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('supports different input types', () => {
    const { rerender } = render(<Input type="text" label="Text" />);
    expect(screen.getByLabelText('Text')).toHaveAttribute('type', 'text');

    rerender(<Input type="email" label="Email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" label="Password" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');

    rerender(<Input type="url" label="URL" />);
    expect(screen.getByLabelText('URL')).toHaveAttribute('type', 'url');
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('has error styling when error is present', () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('border-red-500');
  });

  it('displays helper text', () => {
    render(<Input label="Email" helperText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('does not show helper text when error is present', () => {
    render(
      <Input
        label="Email"
        error="Invalid email"
        helperText="Enter your email address"
      />
    );
    expect(screen.queryByText('Enter your email address')).not.toBeInTheDocument();
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('has proper label association', () => {
    render(<Input label="Username" id="username-input" />);
    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('id', 'username-input');
  });

  it('has proper ARIA attributes for validation', () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });

  it('can be disabled', () => {
    render(<Input label="Email" disabled />);
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });
});
