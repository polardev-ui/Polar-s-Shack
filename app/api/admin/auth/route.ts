import { type NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 })
    }

    // Hash the provided password
    const hashedPassword = createHash("sha256").update(password).digest("hex")

    // The correct password hash for "Mango030911!"
    const correctHash = "50172b3e278ccc1f2caaac89e2911df21304024b98578c4642af9d340fc73b71"

    if (hashedPassword === correctHash) {
      return NextResponse.json({
        success: true,
        token: "admin-authenticated",
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
