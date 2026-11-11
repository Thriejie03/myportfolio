import { NextResponse } from "next/server";
import { getPublishedHomepageContent } from "@/lib/portfolio-content";

export const runtime = "nodejs";

export async function GET() {
  const content = await getPublishedHomepageContent();
  return NextResponse.json({ content }, { headers: { "Cache-Control": "no-store" } });
}
