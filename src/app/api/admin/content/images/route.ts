import { NextResponse } from "next/server";
import { getPortfolioAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await getPortfolioAdminClient();
  if (!supabase) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { data, error } = await supabase.storage
    .from("portfolio-media")
    .list("homepage", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    console.error("Unable to load homepage image library:", error.message);
    return NextResponse.json(
      { error: "Unable to load the image library. Check the portfolio-media Storage setup." },
      { status: 503 },
    );
  }

  const images = data
    .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file.name))
    .map((file) => {
      const path = `homepage/${file.name}`;
      const { data: publicUrl } = supabase.storage.from("portfolio-media").getPublicUrl(path);
      return {
        name: file.name,
        url: publicUrl.publicUrl,
        createdAt: file.created_at,
      };
    });

  return NextResponse.json({ images });
}
