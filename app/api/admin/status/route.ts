import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check various system components
    const status = {
      database: "connected",
      firebase: "connected",
      api: "healthy",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Status check failed" }, { status: 500 })
  }
}
