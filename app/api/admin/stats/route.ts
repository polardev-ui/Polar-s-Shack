import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real implementation, these would come from your database
    const stats = {
      totalUsers: 0,
      onlineUsers: 0,
      totalReports: 0,
      pendingReports: 0,
      proxyRequests: 0,
      systemUptime: Math.floor(process.uptime() / 3600), // Convert to hours
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 })
  }
}
