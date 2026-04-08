import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/sentry-example-api
export async function GET(request: NextRequest) {
  // This endpoint intentionally throws an error for Sentry testing
  throw new Error("✅ Sentry Server-Side API Test - This is intentional!");
  
  // This line will never execute
  return NextResponse.json({ message: "This should not be reached" });
}
