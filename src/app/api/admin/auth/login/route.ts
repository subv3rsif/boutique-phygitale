/**
 * POST /api/admin/auth/login
 *
 * Authenticates admin user with email and password.
 * Creates a signed token and sets HTTP-only cookie (8h expiration).
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { verifyAdminCredentials, createAdminToken } from '@/lib/auth/admin-auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginRequest = z.infer<typeof loginSchema>

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const result = loginSchema.safeParse(body)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: errors,
        },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // Verify credentials against environment variables
    if (!verifyAdminCredentials(email, password)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create signed token
    const token = createAdminToken()

    // Set HTTP-only cookie (8 hours expiration)
    const cookieStore = await cookies()
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours in seconds
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[LOGIN] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
