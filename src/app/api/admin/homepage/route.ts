import { NextResponse } from "next/server";
import { defaultHomepageContent, mergeHomepageContent, type HomepageContent } from "@/data/homepage";
import { getPortfolioAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidHomepageContent(value: unknown): value is HomepageContent {
  if (!isRecord(value) || !isRecord(value.hero) || !isRecord(value.about) || !isRecord(value.achievement) || !isRecord(value.cv)) return false;
  const hero = value.hero;
  const about = value.about;
  const achievement = value.achievement;
  const cv = value.cv;
  const validText = (candidate: unknown, maxLength: number) =>
    typeof candidate === "string" && candidate.trim().length > 0 && candidate.length <= maxLength;

  return (
    validText(hero.greeting, 100) &&
    validText(hero.firstName, 100) &&
    validText(hero.lastName, 100) &&
    validText(hero.role, 250) &&
    validText(hero.summary, 3000) &&
    validText(hero.imageUrl, 2048) &&
    validText(about.heading, 150) &&
    validText(about.accentHeading, 150) &&
    validText(about.description, 3000) &&
    Array.isArray(about.stats) &&
    about.stats.length === 4 &&
    about.stats.every((stat) =>
      isRecord(stat) &&
      validText(stat.value, 40) &&
      validText(stat.label, 80),
    ) &&
    typeof achievement.enabled === "boolean" &&
    validText(achievement.title, 150) &&
    validText(achievement.highlight, 150) &&
    validText(achievement.imageUrl, 2048) &&
    validText(achievement.imageAlt, 500) &&
    validText(achievement.description, 3000) &&
    validText(achievement.eventName, 200) &&
    validText(achievement.date, 100) &&
    (achievement.certificateUrl === "" || (typeof achievement.certificateUrl === "string" && achievement.certificateUrl.length <= 2048)) &&
    (achievement.articleUrl === "" || (typeof achievement.articleUrl === "string" && achievement.articleUrl.length <= 2048)) &&
    validText(cv.label, 60) &&
    validText(cv.url, 2048)
  );
}

function setupError(error: { code?: string }, action: string) {
  const setupMissing = ["42P01", "PGRST204", "PGRST205"].includes(error.code ?? "");
  return NextResponse.json(
    { error: setupMissing ? "Run supabase/portfolio-homepage.sql in Supabase, then try again." : `Unable to ${action}.` },
    { status: 503 },
  );
}

export async function GET() {
  const supabase = await getPortfolioAdminClient();
  if (!supabase) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { data, error } = await supabase
    .from("portfolio_homepage")
    .select("content")
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    console.error("Unable to load homepage admin content:", error.message);
    return setupError(error, "load homepage content");
  }
  return NextResponse.json({ content: data?.content ? mergeHomepageContent(data.content as Partial<HomepageContent>) : defaultHomepageContent });
}

export async function PUT(request: Request) {
  const supabase = await getPortfolioAdminClient();
  if (!supabase) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid homepage content." }, { status: 400 });
  }
  if (!isRecord(body) || !isValidHomepageContent(body.content)) {
    return NextResponse.json({ error: "Please check the homepage content fields and try again." }, { status: 400 });
  }

  const { error } = await supabase
    .from("portfolio_homepage")
    .upsert({ id: "main", content: body.content });

  if (error) {
    console.error("Unable to save homepage content:", error.message);
    return setupError(error, "save homepage content");
  }
  return NextResponse.json({ content: body.content });
}
