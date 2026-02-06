import { describe, it, expect } from 'vitest';
import {
  generatePickupToken,
  hashToken,
  verifyToken,
  generateTokenExpiration,
  isTokenExpired,
} from './token-generator';

describe('Token Generator', () => {
  describe('generatePickupToken', () => {
    it('should generate a token with 64 hex characters', () => {
      const { token } = generatePickupToken();
      expect(token).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
    });

    it('should generate unique tokens', () => {
      const token1 = generatePickupToken();
      const token2 = generatePickupToken();
      expect(token1.token).not.toBe(token2.token);
      expect(token1.tokenHash).not.toBe(token2.tokenHash);
    });

    it('should generate a hash with 64 hex characters', () => {
      const { tokenHash } = generatePickupToken();
      expect(tokenHash).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(tokenHash)).toBe(true);
    });
  });

  describe('hashToken', () => {
    it('should produce consistent hashes for the same token', () => {
      const token = 'test-token-123';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different tokens', () => {
      const token1 = 'test-token-1';
      const token2 = 'test-token-2';
      const hash1 = hashToken(token1);
      const hash2 = hashToken(token2);
      expect(hash1).not.toBe(hash2);
    });

    it('should produce a 64-character hex hash (SHA-256)', () => {
      const hash = hashToken('any-token');
      expect(hash).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid tokens', () => {
      const { token, tokenHash } = generatePickupToken();
      expect(verifyToken(token, tokenHash)).toBe(true);
    });

    it('should reject invalid tokens', () => {
      const { tokenHash } = generatePickupToken();
      const wrongToken = 'wrong-token';
      expect(verifyToken(wrongToken, tokenHash)).toBe(false);
    });

    it('should reject tampered tokens', () => {
      const { token, tokenHash } = generatePickupToken();
      const tamperedToken = token.slice(0, -1) + 'x'; // Change last character
      expect(verifyToken(tamperedToken, tokenHash)).toBe(false);
    });
  });

  describe('generateTokenExpiration', () => {
    it('should generate expiration 30 days in the future by default', () => {
      const now = new Date();
      const expiration = generateTokenExpiration();
      const daysDiff = Math.round(
        (expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBe(30);
    });

    it('should allow custom expiration days', () => {
      const now = new Date();
      const expiration = generateTokenExpiration(7);
      const daysDiff = Math.round(
        (expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBe(7);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isTokenExpired(futureDate)).toBe(false);
    });

    it('should return true for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isTokenExpired(pastDate)).toBe(true);
    });

    it('should return true for current time (edge case)', () => {
      const now = new Date();
      // Subtract 1ms to ensure it's in the past
      now.setMilliseconds(now.getMilliseconds() - 1);
      expect(isTokenExpired(now)).toBe(true);
    });
  });
});
