import '@testing-library/jest-dom';
import Email from '@/containers/manage-page/members/Email';
import { render, screen, fireEvent } from '@testing-library/react';

describe('Email Component', () => {
  const mockOnDelete = jest.fn();

  it('renders an email with avatar', () => {
    render(<Email email="test@example.com" onDelete={mockOnDelete} isDeleting={false} />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByAltText('Avatar')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('disables the delete button while deleting', () => {
    render(<Email email="test@example.com" onDelete={mockOnDelete} isDeleting={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onDelete with the correct email', () => {
    render(<Email email="test@example.com" onDelete={mockOnDelete} isDeleting={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnDelete).toHaveBeenCalledWith('test@example.com');
  });
});
