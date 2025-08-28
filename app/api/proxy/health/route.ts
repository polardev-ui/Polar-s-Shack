import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      status: "online",
      timestamp: new Date().toISOString(),
      server: "Polar's Shack Proxy",
      stats: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: "1.0.0",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Health check failed" }, { status: 500 })
  }
}
