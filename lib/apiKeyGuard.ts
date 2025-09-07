import { NextRequest, NextResponse } from "next/server"

export function validateApiKey(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key")
  // if (apiKey !== process.env.API_KEY) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }

  // const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(","); // e.g., https://example.com,https://www.example.com
  // const origin = req.headers.get("origin");
  // if (origin && !allowedOrigins.includes(origin)) {
  //   return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  // }
  return null
}
