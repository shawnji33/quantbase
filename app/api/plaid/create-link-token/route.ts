import { NextResponse } from "next/server"

// Plaid sandbox only — see https://plaid.com/docs/quickstart/
const PLAID_HOST = "https://sandbox.plaid.com"

export async function POST() {
  const clientId = process.env.PLAID_CLIENT_ID
  const secret = process.env.PLAID_SECRET
  if (!clientId || !secret) {
    return NextResponse.json({ error: "missing_credentials" }, { status: 501 })
  }

  const res = await fetch(`${PLAID_HOST}/link/token/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      secret,
      client_name: "Quantbase",
      user: { client_user_id: "quantbase-onboarding-demo" },
      products: ["auth"],
      country_codes: ["US"],
      language: "en",
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json({ error: data.error_code ?? "plaid_error" }, { status: 502 })
  }
  return NextResponse.json({ link_token: data.link_token })
}
