import { NextResponse } from "next/server";
import { getPortfolioAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidContent(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" && /^[a-z0-9][a-z0-9-]{1,79}$/.test(value.id) &&
    typeof value.title === "string" && value.title.trim().length > 0 && value.title.length <= 160 &&
    typeof value.skill === "string" && value.skill.trim().length > 0 && value.skill.length <= 120 &&
    typeof value.description === "string" && value.description.length <= 2000 &&
    typeof value.videoUrl === "string" && value.videoUrl.trim().length > 0 && value.videoUrl.length <= 2048 &&
    (value.thumbnailUrl === undefined || (typeof value.thumbnailUrl === "string" && value.thumbnailUrl.length <= 2048))
  );
}

function setupError(error: { code?: string }, action: string) {
  const missing = ["42P01", "PGRST204", "PGRST205"].includes(error.code ?? "");
  return NextResponse.json(
    { error: missing ? "Run supabase/portfolio-skill-videos.sql in Supabase, then try again." : `Unable to ${action}.` },
    { status: 503 },
  );
}

export async function GET() {
  const supabase = await getPortfolioAdminClient();
  if (!supabase) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { data, error } = await supabase
    .from("portfolio_skill_videos")
    .select("id, content, is_published, sort_order")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("Unable to load admin skill videos:", error.message);
    return setupError(error, "load skill videos");
  }
  return NextResponse.json({ items: data });
}

export async function POST(request: Request) {
  const supabase = await getPortfolioAdminClient();
  if (!supabase) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid skill video data." }, { status: 400 });
  }
  if (!isRecord(body) || !isValidContent(body.content) ||
      typeof body.is_published !== "boolean" ||
      typeof body.sort_order !== "number" || !Number.isInteger(body.sort_order) ||
      body.sort_order < 0 || body.sort_order > 10000) {
    return NextResponse.json({ error: "Please check the skill video fields and try again." }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("portfolio_skill_videos")
    .upsert({
      id: body.content.id,
      content: body.content,
      is_published: body.is_published,
      sort_order: body.sort_order,
    })
    .select("id, content, is_published, sort_order")
    .single();
  if (error) {
    console.error("Unable to save skill video:", error.message);
    return setupError(error, "save skill video");
  }
  return NextResponse.json({ item: data });
}

export async function DELETE(request: Request) {
  const supabase = await getPortfolioAdminClient();
  if (!supabase) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[a-z0-9][a-z0-9-]{1,79}$/.test(id)) {
    return NextResponse.json({ error: "A valid skill video ID is required." }, { status: 400 });
  }
  const { error } = await supabase.from("portfolio_skill_videos").delete().eq("id", id);
  if (error) {
    console.error("Unable to delete skill video:", error.message);
    return setupError(error, "delete skill video");
  }
  return NextResponse.json({ success: true });
}
