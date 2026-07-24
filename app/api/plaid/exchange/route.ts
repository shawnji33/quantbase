import { NextResponse } from "next/server"

const PLAID_HOST = "https://sandbox.plaid.com"

// Completes the Link loop per the quickstart: public_token → access_token.
// The access token is not persisted anywhere — this is a sandbox prototype.
export async function POST(req: Request) {
  const clientId = process.env.PLAID_CLIENT_ID
  const secret = process.env.PLAID_SECRET
  if (!clientId || !secret) {
    return NextResponse.json({ error: "missing_credentials" }, { status: 501 })
  }

  const { public_token } = await req.json()
  if (typeof public_token !== "string") {
    return NextResponse.json({ error: "missing_public_token" }, { status: 400 })
  }

  const res = await fetch(`${PLAID_HOST}/item/public_token/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, secret, public_token }),
  })
  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json({ error: data.error_code ?? "plaid_error" }, { status: 502 })
  }
  return NextResponse.json({ item_id: data.item_id })
}
