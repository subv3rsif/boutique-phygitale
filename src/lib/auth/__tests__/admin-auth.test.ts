import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createHmac, randomBytes } from 'crypto'
import { cookies } from 'next/headers'

// We need to import these dynamically to allow env vars to be set during tests
let verifyAdminCredentials: any
let createAdminToken: any
let verifyAdminToken: any
let requireAdminAuth: any

// Reload the module before each test to pick up new env vars
beforeEach(async () => {
  // Clear the require cache
  vi.resetModules()
  const adminAuth = await import('../admin-auth')
  verifyAdminCredentials = adminAuth.verifyAdminCredentials
  createAdminToken = adminAuth.createAdminToken
  verifyAdminToken = adminAuth.verifyAdminToken
  requireAdminAuth = adminAuth.requireAdminAuth
})

describe('verifyAdminCredentials', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    process.env.ADMIN_PASSWORD = 'test-password-123'
  })

  it('accepte credentials valides', () => {
    const result = verifyAdminCredentials('admin@test.com', 'test-password-123')
    expect(result).toBe(true)
  })

  it('rejette email invalide', () => {
    const result = verifyAdminCredentials('fake@test.com', 'test-password-123')
    expect(result).toBe(false)
  })

  it('rejette password invalide', () => {
    const result = verifyAdminCredentials('admin@test.com', 'wrong-password')
    expect(result).toBe(false)
  })

  it('rejette si env vars manquantes', () => {
    delete process.env.ADMIN_EMAIL
    delete process.env.ADMIN_PASSWORD

    const result = verifyAdminCredentials('admin@test.com', 'test-password-123')
    expect(result).toBe(false)
  })
})

describe('createAdminToken + verifyAdminToken', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret-key-for-hmac-signature'
  })

  it('génère et vérifie token valide', () => {
    const token = createAdminToken()
    const result = verifyAdminToken(token)

    expect(result.valid).toBe(true)
    expect(result.expired).toBe(false)
  })

  it('rejette token avec signature invalide', () => {
    const token = '1234567890.abcdef1234567890.fakesignature'
    const result = verifyAdminToken(token)

    expect(result.valid).toBe(false)
    expect(result.expired).toBe(false)
  })

  it('rejette token malformé', () => {
    const token = 'invalid-token-format'
    const result = verifyAdminToken(token)

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

    const result = verifyAdminToken(expiredToken)

    expect(result.valid).toBe(false)
    expect(result.expired).toBe(true)
  })

  it('rejette si AUTH_SECRET manquant', () => {
    delete process.env.AUTH_SECRET

    expect(() => createAdminToken()).toThrow()
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

    await expect(requireAdminAuth()).rejects.toThrow('Unauthorized: No admin token')
  })

  it('throw si token invalide', async () => {
    const mockCookies = {
      get: vi.fn().mockReturnValue({ value: 'invalid-token' })
    }
    vi.mocked(cookies).mockResolvedValue(mockCookies as any)

    await expect(requireAdminAuth()).rejects.toThrow('Unauthorized: Invalid token')
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

    await expect(requireAdminAuth()).rejects.toThrow('Unauthorized: Session expired')
  })

  it('ne throw pas si token valide', async () => {
    const validToken = createAdminToken()
    const mockCookies = {
      get: vi.fn().mockReturnValue({ value: validToken })
    }
    vi.mocked(cookies).mockResolvedValue(mockCookies as any)

    await expect(requireAdminAuth()).resolves.toBeUndefined()
  })
})
