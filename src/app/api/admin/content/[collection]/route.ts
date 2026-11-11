import { NextResponse } from "next/server";
import { certificates } from "@/data/certificates";
import { projects } from "@/data/projects";
import { getPortfolioAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Collection = "projects" | "certificates" | "chatbot-faq";
type ContentTable = "portfolio_projects" | "portfolio_certificates" | "portfolio_chatbot_faq";

function resolveCollection(value: string): { collection: Collection; table: ContentTable } | null {
  if (value === "projects") return { collection: "projects", table: "portfolio_projects" };
  if (value === "certificates") return { collection: "certificates", table: "portfolio_certificates" };
  if (value === "chatbot-faq") return { collection: "chatbot-faq", table: "portfolio_chatbot_faq" };
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function contentSetupError(error: { code?: string }, action: string) {
  const setupMissing = ["42P01", "PGRST204", "PGRST205"].includes(error.code ?? "");
  return NextResponse.json(
    { error: setupMissing ? "Run supabase/portfolio-content.sql in Supabase, then try again." : `Unable to ${action}.` },
    { status: 503 },
  );
}

function validateContent(collection: Collection, value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || !/^[a-z0-9][a-z0-9-]{1,79}$/.test(value.id)) return false;

  if (collection === "chatbot-faq") {
    return (
      typeof value.question === "string" && value.question.trim().length > 0 && value.question.length <= 300 &&
      typeof value.answer === "string" && value.answer.trim().length > 0 && value.answer.length <= 3000 &&
      (value.keywords === undefined || (Array.isArray(value.keywords) && value.keywords.length <= 40 && value.keywords.every((k) => typeof k === "string" && k.length <= 80))) &&
      (value.category === undefined || typeof value.category === "string")
    );
  }

  if (collection === "projects") {
    return (
      typeof value.title === "string" && value.title.trim().length > 0 && value.title.length <= 160 &&
      typeof value.description === "string" && value.description.trim().length > 0 && value.description.length <= 5000 &&
      Array.isArray(value.technologies) && value.technologies.length <= 40 &&
      value.technologies.every((entry) => typeof entry === "string" && entry.length <= 80) &&
      Array.isArray(value.features) && value.features.length <= 40 &&
      value.features.every((entry) => typeof entry === "string" && entry.length <= 500) &&
      typeof value.imageUrl === "string" && value.imageUrl.length <= 2048 &&
      ["Fullstack", "Frontend", "Backend", "IoT", "Game Dev", "Desktop"].includes(String(value.category)) &&
      (value.gallery === undefined || (Array.isArray(value.gallery) && value.gallery.length <= 40 && value.gallery.every((entry) => typeof entry === "string" && entry.length <= 2048))) &&
      ["githubUrl", "liveUrl", "documentationUrl", "videoUrl", "videoThumbnailUrl"].every((key) => value[key] === undefined || (typeof value[key] === "string" && value[key].length <= 2048))
    );
  }

  return (
    typeof value.title === "string" && value.title.trim().length > 0 && value.title.length <= 200 &&
    typeof value.issuer === "string" && value.issuer.trim().length > 0 && value.issuer.length <= 200 &&
    typeof value.date === "string" && value.date.length <= 80 &&
    typeof value.imageUrl === "string" && value.imageUrl.length <= 2048 &&
    ["Programming", "Web Development", "Database", "IoT", "Blockchain", "Networking", "Electrical"].includes(String(value.category)) &&
    (value.link === undefined || (typeof value.link === "string" && value.link.length <= 2048)) &&
    (value.showOnCertificatesPage === undefined || typeof value.showOnCertificatesPage === "boolean")
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection: path } = await params;
  const resolved = resolveCollection(path);
  if (!resolved) return NextResponse.json({ error: "Unknown content collection." }, { status: 404 });

  const supabase = await getPortfolioAdminClient();
  if (!supabase) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const columns = resolved.collection === "chatbot-faq"
    ? "id, content, is_published, sort_order"
    : "id, content, is_published, is_featured, sort_order";

  const { data, error } = await supabase
    .from(resolved.table)
    .select(columns)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(`Unable to load admin ${resolved.collection}:`, error.message);
    return contentSetupError(error, "load content");
  }

  return NextResponse.json({ items: data });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection: path } = await params;
  const resolved = resolveCollection(path);
  if (!resolved) return NextResponse.json({ error: "Unknown content collection." }, { status: 404 });

  const supabase = await getPortfolioAdminClient();
  if (!supabase) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid content data." }, { status: 400 });
  }

  if (isRecord(body) && body.action === "import-existing") {
    if (resolved.collection === "chatbot-faq") {
      return NextResponse.json({ imported: 0, skipped: 0 });
    }
    const initial = resolved.collection === "projects" ? projects : certificates;
    const { data: existingRows, error: existingError } = await supabase
      .from(resolved.table)
      .select("id");
    if (existingError) {
      console.error(`Unable to check existing ${resolved.collection}:`, existingError.message);
      return contentSetupError(existingError, "check existing content");
    }
    const existingIds = new Set((existingRows ?? []).map((row: { id: string }) => row.id));
    const rows = initial
      .filter((item) => !existingIds.has(item.id))
      .map((item, index) => ({
        id: item.id,
        content: item,
        is_published: true,
        is_featured: resolved.collection === "projects" && index < 3,
        sort_order: existingIds.size + index,
      }));
    if (rows.length > 0) {
      const { error: importError } = await supabase.from(resolved.table).insert(rows);
      if (importError) {
        console.error(`Unable to import existing ${resolved.collection}:`, importError.message);
        return contentSetupError(importError, "import existing content");
      }
    }
    return NextResponse.json({ imported: rows.length, skipped: existingIds.size });
  }

  if (!isRecord(body) || !validateContent(resolved.collection, body.content)) {
    return NextResponse.json({ error: "Please check the content fields and try again." }, { status: 400 });
  }
  if (
    typeof body.is_published !== "boolean" ||
    typeof body.sort_order !== "number" ||
    !Number.isInteger(body.sort_order) ||
    body.sort_order < 0 ||
    body.sort_order > 10000
  ) {
    return NextResponse.json({ error: "Content visibility settings are invalid." }, { status: 400 });
  }

  const row: Record<string, unknown> = {
    id: body.content.id,
    content: body.content,
    is_published: body.is_published,
    sort_order: body.sort_order,
  };
  if (resolved.collection !== "chatbot-faq") {
    row.is_featured = resolved.collection === "projects" && body.is_featured;
  }

  const selectColumns = resolved.collection === "chatbot-faq"
    ? "id, content, is_published, sort_order"
    : "id, content, is_published, is_featured, sort_order";

  const { data, error } = await supabase
    .from(resolved.table)
    .upsert(row)
    .select(selectColumns)
    .single();

  if (error) {
    console.error(`Unable to save ${resolved.collection}:`, error.message);
    return contentSetupError(error, "save content");
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection: path } = await params;
  const resolved = resolveCollection(path);
  if (!resolved) return NextResponse.json({ error: "Unknown content collection." }, { status: 404 });

  const supabase = await getPortfolioAdminClient();
  if (!supabase) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[a-z0-9][a-z0-9-]{1,79}$/.test(id)) {
    return NextResponse.json({ error: "A valid content ID is required." }, { status: 400 });
  }

  const { error } = await supabase.from(resolved.table).delete().eq("id", id);
  if (error) {
    console.error(`Unable to delete ${resolved.collection}:`, error.message);
    return contentSetupError(error, "delete content");
  }

  return NextResponse.json({ success: true });
}
