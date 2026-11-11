import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const runtime = "nodejs";

interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isContactSubmission(value: unknown): value is ContactSubmission {
  if (!isRecord(value)) return false;

  return (
    "name" in value && typeof value.name === "string" &&
    "email" in value && typeof value.email === "string" &&
    "subject" in value && typeof value.subject === "string" &&
    "message" in value && typeof value.message === "string" &&
    "website" in value && typeof value.website === "string"
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit a valid message." }, { status: 400 });
  }

  if (!isContactSubmission(body)) {
    return NextResponse.json({ error: "Please complete all contact fields." }, { status: 400 });
  }

  if (body.website.trim()) {
    return NextResponse.json({ success: true });
  }

  const name = body.name.trim();
  const email = body.email.trim().toLowerCase();
  const subject = body.subject.trim();
  const message = body.message.trim();

  if (
    name.length < 2 ||
    name.length > 100 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    subject.length < 2 ||
    subject.length > 150 ||
    message.length < 10 ||
    message.length > 5000
  ) {
    return NextResponse.json({ error: "Check your details and message, then try again." }, { status: 400 });
  }

  const config = getSupabaseConfig();
  if (!config) {
    console.error("Contact form is not configured: Supabase environment variables are missing.");
    return NextResponse.json({ error: "The message form is temporarily unavailable. Please email directly." }, { status: 503 });
  }

  const supabase = createClient(config.url, config.publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.from("portfolio_messages").insert({
    name,
    email,
    subject,
    message,
  });

  if (error) {
    console.error("Unable to save contact submission:", error.message);
    return NextResponse.json({ error: "Your message could not be saved. Please email directly." }, { status: 503 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
