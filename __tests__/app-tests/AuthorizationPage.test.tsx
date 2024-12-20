import '@testing-library/jest-dom';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import AuthorizationPage from '@/app/authorization/page';
import { getMemberToken } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock other dependencies
jest.mock('@/utils/api', () => ({
  getMemberToken: jest.fn(),
}));
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('AuthorizationPage', () => {
  const pushMock = jest.fn();
  const replaceMock = jest.fn();
  const toastMock = jest.fn();

  beforeEach(() => {
    // Mock useRouter to include replace and push methods
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      replace: replaceMock,
    });

    // Mock useToast
    (useToast as jest.Mock).mockReturnValue({
      toast: toastMock,
    });

    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('should navigate to modules on successful login', async () => {
    const { getByText } = render(<AuthorizationPage />);
    (getMemberToken as jest.Mock).mockResolvedValueOnce({ access_token: 'test-token' });

    fireEvent.change(screen.getByPlaceholderText(/email1@example.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password' },
    });
    fireEvent.click(getByText(/log in/i));

    await waitFor(() => {
      expect(localStorage.getItem('accessToken')).toBe('test-token');
      expect(pushMock).toHaveBeenCalledWith('/modules');
    });
  });
});
