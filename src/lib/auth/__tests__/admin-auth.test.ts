import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createHmac, randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import type { verifyAdminCredentials, createAdminToken, verifyAdminToken, requireAdminAuth } from '../admin-auth'

// We need to import these dynamically to allow env vars to be set during tests
let verifyAdminCredentialsImpl: typeof verifyAdminCredentials
let createAdminTokenImpl: typeof createAdminToken
let verifyAdminTokenImpl: typeof verifyAdminToken
let requireAdminAuthImpl: typeof requireAdminAuth

// Reload the module before each test to pick up new env vars
beforeEach(async () => {
  // Clear the require cache
  vi.resetModules()
  const adminAuth = await import('../admin-auth')
  verifyAdminCredentialsImpl = adminAuth.verifyAdminCredentials
  createAdminTokenImpl = adminAuth.createAdminToken
  verifyAdminTokenImpl = adminAuth.verifyAdminToken
  requireAdminAuthImpl = adminAuth.requireAdminAuth
})

describe('verifyAdminCredentials', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    process.env.ADMIN_PASSWORD = 'test-password-123'
  })

  it('accepte credentials valides', () => {
    const result = verifyAdminCredentialsImpl('admin@test.com', 'test-password-123')
    expect(result).toBe(true)
  })

  it('rejette email invalide', () => {
    const result = verifyAdminCredentialsImpl('fake@test.com', 'test-password-123')
    expect(result).toBe(false)
  })

  it('rejette password invalide', () => {
    const result = verifyAdminCredentialsImpl('admin@test.com', 'wrong-password')
    expect(result).toBe(false)
  })

  it('rejette si env vars manquantes', () => {
    delete process.env.ADMIN_EMAIL
    delete process.env.ADMIN_PASSWORD

    const result = verifyAdminCredentialsImpl('admin@test.com', 'test-password-123')
    expect(result).toBe(false)
  })
})

describe('createAdminToken + verifyAdminToken', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret-key-for-hmac-signature'
  })

  it('génère et vérifie token valide', () => {
    const token = createAdminTokenImpl()
    const result = verifyAdminTokenImpl(token)

    expect(result.valid).toBe(true)
    expect(result.expired).toBe(false)
  })

  it('rejette token avec signature invalide', () => {
    const token = '1234567890.abcdef1234567890.fakesignature'
    const result = verifyAdminTokenImpl(token)

    expect(result.valid).toBe(false)
    expect(result.expired).toBe(false)
  })

  it('rejette token malformé', () => {
    const token = 'invalid-token-format'
    const result = verifyAdminTokenImpl(token)

    expect(result.valid).toBe(false)
    expect(result.expired).toBe(false)
  })

  it('détecte token expiré', () => {
    // Mock token créé il y a 9 heures (> 8h expiration)
    const oldTimestamp = Date.now() - (9 * 60 * 60 * 1000)
    const random = randomBytes(16).toString('hex')
    const payload = `${oldTimestamp}.${random}`
    const signature = createHmac('sha256', process.env.AUTH_SECRET!)
      .update(payload)
      .digest('hex')
    const expiredToken = `${payload}.${signature}`

    const result = verifyAdminTokenImpl(expiredToken)

    expect(result.valid).toBe(false)
    expect(result.expired).toBe(true)
  })

  it('rejette si AUTH_SECRET manquant', () => {
    delete process.env.AUTH_SECRET

    expect(() => createAdminTokenImpl()).toThrow()
  })
})

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn()
}))

describe('requireAdminAuth', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret-key'
  })

  it('throw si cookie absent', async () => {
    const mockCookies = {
      get: vi.fn().mockReturnValue(undefined)
    }
    vi.mocked(cookies).mockResolvedValue(mockCookies as any)

    await expect(requireAdminAuthImpl()).rejects.toThrow('Unauthorized: No admin token')
  })

  it('throw si token invalide', async () => {
    const mockCookies = {
      get: vi.fn().mockReturnValue({ value: 'invalid-token' })
    }
    vi.mocked(cookies).mockResolvedValue(mockCookies as any)

    await expect(requireAdminAuthImpl()).rejects.toThrow('Unauthorized: Invalid token')
  })

  it('throw si token expiré', async () => {
    // Create expired token
    const oldTimestamp = Date.now() - (9 * 60 * 60 * 1000)
    const random = randomBytes(16).toString('hex')
    const payload = `${oldTimestamp}.${random}`
    const signature = createHmac('sha256', process.env.AUTH_SECRET!)
      .update(payload)
      .digest('hex')
    const expiredToken = `${payload}.${signature}`

    const mockCookies = {
      get: vi.fn().mockReturnValue({ value: expiredToken })
    }
    vi.mocked(cookies).mockResolvedValue(mockCookies as any)

    await expect(requireAdminAuthImpl()).rejects.toThrow('Unauthorized: Session expired')
  })

  it('ne throw pas si token valide', async () => {
    const validToken = createAdminTokenImpl()
    const mockCookies = {
      get: vi.fn().mockReturnValue({ value: validToken })
    }
    vi.mocked(cookies).mockResolvedValue(mockCookies as any)

    await expect(requireAdminAuthImpl()).resolves.toBeUndefined()
  })
})
