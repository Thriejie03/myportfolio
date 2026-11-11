import { NextResponse } from "next/server";
import { getPublishedHobbies } from "@/lib/portfolio-content";

export const runtime = "nodejs";

export async function GET() {
  const hobbies = await getPublishedHobbies();
  return NextResponse.json({ hobbies }, { headers: { "Cache-Control": "no-store" } });
}
