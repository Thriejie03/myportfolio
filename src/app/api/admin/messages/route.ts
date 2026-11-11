import { NextResponse } from "next/server";
import { getPortfolioAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await getPortfolioAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("portfolio_messages")
    .select("id, name, email, subject, message, is_read, is_archived, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Unable to load portfolio messages:", error.message);
    return NextResponse.json({ error: "Unable to load messages." }, { status: 503 });
  }

  return NextResponse.json({ messages: data });
}

export async function PATCH(request: Request) {
  const supabase = await getPortfolioAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || !("id" in body) || typeof body.id !== "string") {
    return NextResponse.json({ error: "A valid message ID is required." }, { status: 400 });
  }

  const id = body.id;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "A valid message ID is required." }, { status: 400 });
  }

  const updates: { is_read?: boolean; is_archived?: boolean } = {};
  if ("is_read" in body && typeof body.is_read === "boolean") updates.is_read = body.is_read;
  if ("is_archived" in body && typeof body.is_archived === "boolean") updates.is_archived = body.is_archived;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid message updates were provided." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("portfolio_messages")
    .update(updates)
    .eq("id", id)
    .select("id, name, email, subject, message, is_read, is_archived, created_at")
    .single();

  if (error) {
    console.error("Unable to update portfolio message:", error.message);
    return NextResponse.json({ error: "Unable to update message." }, { status: 503 });
  }

  return NextResponse.json({ message: data });
}
