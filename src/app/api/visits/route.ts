import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    console.error("Visit counter is not configured: Supabase URL or publishable key is missing.");
    return NextResponse.json({ error: "Visit counter is not configured." }, { status: 503 });
  }

  let rpcUrl: URL;
  try {
    rpcUrl = new URL("/rest/v1/rpc/increment_portfolio_visits", supabaseUrl);
  } catch (error) {
    console.error("Visit counter has an invalid SUPABASE_URL:", error);
    return NextResponse.json({ error: "Visit counter is unavailable." }, { status: 503 });
  }

  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    if (!response.ok) {
      const details = await response.text();
      console.error(`Supabase visit counter failed (${response.status}): ${details}`);
      return NextResponse.json({ error: "Visit counter is unavailable." }, { status: 503 });
    }

    const count: unknown = await response.json();
    if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) {
      console.error("Supabase visit counter returned an invalid count.");
      return NextResponse.json({ error: "Visit counter is unavailable." }, { status: 502 });
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Unable to reach Supabase visit counter:", error);
    return NextResponse.json({ error: "Visit counter is unavailable." }, { status: 503 });
  }
}
