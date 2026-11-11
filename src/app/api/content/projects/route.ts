import { NextResponse } from "next/server";
import { getPublishedProjects } from "@/lib/portfolio-content";

export const runtime = "nodejs";

export async function GET() {
  const projects = await getPublishedProjects();
  return NextResponse.json({ projects }, { headers: { "Cache-Control": "no-store" } });
}
