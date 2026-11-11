import { createClient } from "@supabase/supabase-js";
import { certificates, type Certificate } from "@/data/certificates";
import { projects } from "@/data/projects";
import { defaultHomepageContent, mergeHomepageContent, type HomepageContent } from "@/data/homepage";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Project } from "@/types/project";

interface ContentRow {
  content: Record<string, unknown>;
  is_featured: boolean;
}

function createPublicClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function loadPublishedContent<T extends object>(
  table: "portfolio_projects" | "portfolio_certificates",
  fallback: T[],
): Promise<T[]> {
  const supabase = createPublicClient();
  if (!supabase) return fallback;

  const { data, error } = await supabase
    .from(table)
    .select("content, is_featured")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(`Unable to load public portfolio content from ${table}:`, error.message);
    return fallback;
  }

  return (data as ContentRow[]).map((row) => ({
    ...row.content,
    ...(table === "portfolio_projects" ? { isFeatured: row.is_featured } : {}),
  }) as T);
}

export async function getPublishedProjects(): Promise<Project[]> {
  return loadPublishedContent<Project>(
    "portfolio_projects",
    projects.map((project, index) => ({
      ...project,
      isFeatured: index < 3,
    })),
  );
}

export async function getPublishedCertificates(): Promise<Certificate[]> {
  return loadPublishedContent<Certificate>(
    "portfolio_certificates",
    certificates,
  );
}

export async function getPublishedHomepageContent(): Promise<HomepageContent> {
  const supabase = createPublicClient();
  if (!supabase) return defaultHomepageContent;

  const { data, error } = await supabase
    .from("portfolio_homepage")
    .select("content")
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    console.error("Unable to load public homepage content:", error.message);
    return defaultHomepageContent;
  }
  if (!data) return defaultHomepageContent;
  return mergeHomepageContent(data.content as Partial<HomepageContent>);
}
