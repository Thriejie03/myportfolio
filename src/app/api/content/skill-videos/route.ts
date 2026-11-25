import { NextResponse } from "next/server";
import { getPublishedSkillVideos } from "@/lib/portfolio-content";

export const runtime = "nodejs";

export async function GET() {
  const skillVideos = await getPublishedSkillVideos();
  return NextResponse.json({ skillVideos }, { headers: { "Cache-Control": "no-store" } });
}
