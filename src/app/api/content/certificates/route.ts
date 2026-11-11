import { NextResponse } from "next/server";
import { getPublishedCertificates } from "@/lib/portfolio-content";

export const runtime = "nodejs";

export async function GET() {
  const certificates = await getPublishedCertificates();
  return NextResponse.json({ certificates }, { headers: { "Cache-Control": "no-store" } });
}
