/**
 * QR Scanner Component Tests
 *
 * Test coverage for mobile-first pickup validation interface
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QRScanner } from '../qr-scanner';

// Mock fetch globally
global.fetch = vi.fn();

describe('QRScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render token input with proper attributes', () => {
      render(<QRScanner />);

      const input = screen.getByLabelText(/token de retrait/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('placeholder', 'Collez le token ici');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });

    it('should render validation button disabled when token is empty', () => {
      render(<QRScanner />);

      const button = screen.getByRole('button', { name: /valider le retrait/i });
      expect(button).toBeDisabled();
    });

    it('should enable validation button when token is entered', async () => {
      render(<QRScanner />);
      const user = userEvent.setup();

      const input = screen.getByLabelText(/token de retrait/i);
      await user.type(input, 'test-token-123');

      const button = screen.getByRole('button', { name: /valider le retrait/i });
      expect(button).not.toBeDisabled();
    });

    it('should render help section as collapsed by default', () => {
      render(<QRScanner />);

      const helpButton = screen.getByRole('button', { name: /besoin d'aide/i });
      expect(helpButton).toHaveAttribute('aria-expanded', 'false');

      const helpContent = screen.queryByText(/codes d'erreur courants/i);
      expect(helpContent).not.toBeInTheDocument();
    });
  });

  describe('Token Validation - Success', () => {
    it('should display success state with order details', async () => {
      const mockResponse = {
        success: true,
        message: 'Retrait validé avec succès',
        order: {
          id: 'abc123456789',
          customerEmail: 'test@example.com',
          grandTotalCents: 1200,
          createdAt: '2024-01-15T10:30:00Z',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<QRScanner />);
      const user = userEvent.setup();

      const input = screen.getByLabelText(/token de retrait/i);
      await user.type(input, 'valid-token-123');

      const button = screen.getByRole('button', { name: /valider le retrait/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/retrait validé avec succès/i)).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
        expect(screen.getByText(/12,00 €/i)).toBeInTheDocument();
        expect(screen.getByText(/#ABC12345/i)).toBeInTheDocument();
      });
    });

    it('should clear input after 3 seconds on success', async () => {
      vi.useFakeTimers();

      const mockResponse = {
        success: true,
        message: 'Retrait validé avec succès',
        order: {
          id: 'abc123456789',
          customerEmail: 'test@example.com',
          grandTotalCents: 1200,
          createdAt: '2024-01-15T10:30:00Z',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<QRScanner />);
      const user = userEvent.setup();

      const input = screen.getByLabelText(/token de retrait/i) as HTMLInputElement;
      await user.type(input, 'valid-token-123');

      const button = screen.getByRole('button', { name: /valider le retrait/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/retrait validé avec succès/i)).toBeInTheDocument();
      });

      expect(input.value).toBe('valid-token-123');

      // Fast-forward 3 seconds
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(input.value).toBe('');
      });

      vi.useRealTimers();
    });
  });

  describe('Token Validation - Errors', () => {
    it('should display error state with error code badge', async () => {
      const mockError = {
        error: 'Token invalide',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockError,
      });

      render(<QRScanner />);
      const user = userEvent.setup();

      const input = screen.getByLabelText(/token de retrait/i);
      await user.type(input, 'invalid-token');

      const button = screen.getByRole('button', { name: /valider le retrait/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/validation échouée/i)).toBeInTheDocument();
        expect(screen.getByText(/token invalide/i)).toBeInTheDocument();
        expect(screen.getByText('404')).toBeInTheDocument();
      });
    });

    it('should display additional details for already used token (409)', async () => {
      const mockError = {
        error: 'Token déjà utilisé',
        usedAt: '2024-01-15T14:00:00Z',
        usedBy: 'staff@ville.fr',
        currentStatus: 'fulfilled',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => mockError,
      });

      render(<QRScanner />);
      const user = userEvent.setup();

      const input = screen.getByLabelText(/token de retrait/i);
      await user.type(input, 'used-token');

      const button = screen.getByRole('button', { name: /valider le retrait/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/token déjà utilisé/i)).toBeInTheDocument();
        expect(screen.getByText(/staff@ville.fr/i)).toBeInTheDocument();
        expect(screen.getByText(/fulfilled/i)).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Interaction', () => {
    it('should validate on Enter key press', async () => {
      const mockResponse = {
        success: true,
        message: 'Retrait validé avec succès',
        order: {
          id: 'abc123456789',
          customerEmail: 'test@example.com',
          grandTotalCents: 1200,
          createdAt: '2024-01-15T10:30:00Z',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<QRScanner />);
      const user = userEvent.setup();

      const input = screen.getByLabelText(/token de retrait/i);
      await user.type(input, 'valid-token-123{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/retrait validé avec succès/i)).toBeInTheDocument();
      });
    });

    it('should not validate on Enter if already validating', async () => {
      (global.fetch as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<QRScanner />);
      const user = userEvent.setup();

      const input = screen.getByLabelText(/token de retrait/i);
      await user.type(input, 'token{Enter}');

      // Try pressing Enter again immediately
      await user.keyboard('{Enter}');

      // Should only call fetch once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auto-validate on Paste', () => {
    it('should auto-validate when pasting long token (>20 chars)', async () => {
      vi.useFakeTimers();

      const mockResponse = {
        success: true,
        message: 'Retrait validé avec succès',
        order: {
          id: 'abc123456789',
          customerEmail: 'test@example.com',
          grandTotalCents: 1200,
          createdAt: '2024-01-15T10:30:00Z',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<QRScanner />);

      const input = screen.getByLabelText(/token de retrait/i);
      const longToken = 'a'.repeat(30);

      // Simulate paste event
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => longToken,
        },
      });

      // Fast-forward 100ms (auto-validate delay)
      vi.advanceTimersByTime(100);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/pickup/redeem',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });

      vi.useRealTimers();
    });

    it('should not auto-validate on short paste (<20 chars)', async () => {
      render(<QRScanner />);

      const input = screen.getByLabelText(/token de retrait/i);
      const shortToken = 'abc';

      fireEvent.paste(input, {
        clipboardData: {
          getData: () => shortToken,
        },
      });

      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });
  });

  describe('Help Section', () => {
    it('should toggle help section on button click', async () => {
      render(<QRScanner />);
      const user = userEvent.setup();

      const helpButton = screen.getByRole('button', { name: /besoin d'aide/i });

      // Initially collapsed
      expect(helpButton).toHaveAttribute('aria-expanded', 'false');

      // Click to expand
      await user.click(helpButton);

      expect(helpButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText(/codes d'erreur courants/i)).toBeInTheDocument();

      // Click to collapse
      await user.click(helpButton);

      expect(helpButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should display all error codes with descriptions', async () => {
      render(<QRScanner />);
      const user = userEvent.setup();

      const helpButton = screen.getByRole('button', { name: /besoin d'aide/i });
      await user.click(helpButton);

      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('410')).toBeInTheDocument();
      expect(screen.getByText('409')).toBeInTheDocument();
      expect(screen.getByText('400')).toBeInTheDocument();

      expect(screen.getByText(/token invalide/i)).toBeInTheDocument();
      expect(screen.getByText(/token expiré/i)).toBeInTheDocument();
      expect(screen.getByText(/déjà utilisé/i)).toBeInTheDocument();
      expect(screen.getByText(/commande non payée/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on result container', async () => {
      const mockResponse = {
        success: true,
        message: 'Retrait validé avec succès',
        order: {
          id: 'abc123456789',
          customerEmail: 'test@example.com',
          grandTotalCents: 1200,
          createdAt: '2024-01-15T10:30:00Z',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<QRScanner />);
      const user = userEvent.setup();

      const input = screen.getByLabelText(/token de retrait/i);
      await user.type(input, 'valid-token-123');

      const button = screen.getByRole('button', { name: /valider le retrait/i });
      await user.click(button);

      await waitFor(() => {
        const statusContainer = screen.getByRole('status');
        expect(statusContainer).toHaveAttribute('aria-live', 'polite');
        expect(statusContainer).toHaveAttribute('aria-atomic', 'true');
      });
    });

    it('should auto-focus input on mount', () => {
      render(<QRScanner />);

      const input = screen.getByLabelText(/token de retrait/i);
      expect(input).toHaveFocus();
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner during validation', async () => {
      (global.fetch as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<QRScanner />);
      const user = userEvent.setup();

      const input = screen.getByLabelText(/token de retrait/i);
      await user.type(input, 'token');

      const button = screen.getByRole('button', { name: /valider le retrait/i });
      await user.click(button);

      expect(screen.getByText(/validation en cours/i)).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(input).toBeDisabled();
    });
  });
});
