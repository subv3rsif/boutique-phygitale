/**
 * POST /api/admin/auth/logout
 *
 * Logs out the admin user by deleting the admin-token cookie.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin-token')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[LOGOUT] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
