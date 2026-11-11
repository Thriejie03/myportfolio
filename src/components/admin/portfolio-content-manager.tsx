"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showErrorAlert, showSuccessToast } from "@/lib/alerts";
import type { Certificate } from "@/data/certificates";
import type { Project } from "@/types/project";

type Collection = "projects" | "certificates";
type ContentItem = {
  id: string;
  content: Record<string, unknown>;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
};

const projectCategories: Project["category"][] = ["Fullstack", "Frontend", "Backend", "IoT", "Game Dev", "Desktop"];
const certificateCategories: Certificate["category"][] = ["Programming", "Web Development", "Database", "IoT", "Blockchain", "Networking", "Electrical"];

function isContentItem(value: unknown): value is ContentItem {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value && typeof value.id === "string" &&
    "content" in value && typeof value.content === "object" && value.content !== null &&
    "is_published" in value && typeof value.is_published === "boolean" &&
    "is_featured" in value && typeof value.is_featured === "boolean" &&
    "sort_order" in value && typeof value.sort_order === "number"
  );
}

function field(content: Record<string, unknown>, key: string, fallback = "") {
  return typeof content[key] === "string" ? content[key] as string : fallback;
}

function textList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join("\n") : "";
}

function splitLines(value: string) {
  return value.split("\n").map((entry) => entry.trim()).filter(Boolean);
}

export function PortfolioContentManager() {
  const [collection, setCollection] = React.useState<Collection>("projects");
  const [items, setItems] = React.useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<ContentItem | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  const loadItems = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/content/${collection}`, { cache: "no-store" });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to load portfolio content."));
      if (!isRecord(data) || !Array.isArray(data.items) || !data.items.every(isContentItem)) {
        throw new Error("The content manager returned an invalid response.");
      }
      setItems(data.items);
    } catch (error) {
      console.error(`Unable to load ${collection}:`, error);
      await showErrorAlert("Could not load content", error instanceof Error ? error.message : "Unable to load portfolio content.");
    } finally {
      setIsLoading(false);
    }
  }, [collection]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void loadItems(), 0);
    return () => window.clearTimeout(timer);
  }, [loadItems]);

  async function importExisting() {
    try {
      const response = await fetch(`/api/admin/content/${collection}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import-existing" }),
      });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to import existing content."));
      await loadItems();
      const imported = isRecord(data) && typeof data.imported === "number" ? data.imported : 0;
      await showSuccessToast(imported > 0 ? `${imported} ${collection} imported` : "Nothing new to import");
    } catch (error) {
      console.error(`Unable to import ${collection}:`, error);
      await showErrorAlert("Import failed", error instanceof Error ? error.message : "Unable to import existing content.");
    }
  }

  async function deleteItem(item: ContentItem) {
    const confirmed = await SwalConfirm(`Delete "${field(item.content, "title", item.id)}"?`);
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/admin/content/${collection}?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to delete item."));
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      await showSuccessToast("Portfolio item deleted");
    } catch (error) {
      console.error(`Unable to delete ${collection} item:`, error);
      await showErrorAlert("Could not delete item", error instanceof Error ? error.message : "Unable to delete item.");
    }
  }

  async function saveItem(content: Record<string, unknown>, visibility: { is_published: boolean; is_featured: boolean; sort_order: number }) {
    try {
      const response = await fetch(`/api/admin/content/${collection}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, ...visibility }),
      });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to save portfolio content."));
      if (!isRecord(data) || !isContentItem(data.item)) throw new Error("The save response was invalid.");
      const savedItem = data.item;
      setItems((current) => {
        const index = current.findIndex((entry) => entry.id === savedItem.id);
        if (index < 0) return [...current, savedItem].sort((a, b) => a.sort_order - b.sort_order);
        return current.map((entry) => entry.id === savedItem.id ? savedItem : entry).sort((a, b) => a.sort_order - b.sort_order);
      });
      setEditing(null);
      setIsCreating(false);
      await showSuccessToast("Portfolio content saved");
    } catch (error) {
      console.error(`Unable to save ${collection}:`, error);
      await showErrorAlert("Could not save content", error instanceof Error ? error.message : "Unable to save portfolio content.");
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 pb-24">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portfolio Content</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage public projects and certificates, including their images.</p>
        </div>
        <Button type="button" onClick={() => { setEditing(null); setIsCreating(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add {collection === "projects" ? "project" : "certificate"}
        </Button>
      </div>

      <div className="mb-6 flex gap-2 items-center">
        <Button type="button" variant={collection === "projects" ? "default" : "outline"} onClick={() => { setCollection("projects"); setEditing(null); setIsCreating(false); }}>Projects</Button>
        <Button type="button" variant={collection === "certificates" ? "default" : "outline"} onClick={() => { setCollection("certificates"); setEditing(null); setIsCreating(false); }}>Certificates</Button>
        <Button type="button" variant="outline" className="ml-auto" onClick={() => void importExisting()} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" /> Import missing
        </Button>
        <Button type="button" variant="outline" onClick={() => void loadItems()} disabled={isLoading} aria-label="Refresh content">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading ? (
        <p className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Loading content…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-foreground">No {collection} found yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">Import the current website content as a starting point, or add a new item.</p>
          <Button type="button" className="mt-5" variant="outline" onClick={() => void importExisting()}>
            Import existing {collection}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
              <Image src={field(item.content, "imageUrl")} alt="" width={112} height={80} unoptimized className="h-20 w-28 rounded-lg border border-border bg-muted object-cover" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold text-foreground">{field(item.content, "title", item.id)}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.is_published ? "Published" : "Hidden"}{collection === "projects" && item.is_featured ? " · Featured on homepage" : ""}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => { setEditing(item); setIsCreating(false); }}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button type="button" variant="outline" size="sm" className="text-destructive" onClick={() => void deleteItem(item)} aria-label={`Delete ${field(item.content, "title", item.id)}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {(editing || isCreating) && (
        <ContentEditor
          key={`${collection}-${editing?.id ?? "new"}`}
          collection={collection}
          item={editing}
          onCancel={() => { setEditing(null); setIsCreating(false); }}
          onSave={saveItem}
        />
      )}
    </section>
  );
}

function ContentEditor({
  collection,
  item,
  onCancel,
  onSave,
}: {
  collection: Collection;
  item: ContentItem | null;
  onCancel: () => void;
  onSave: (content: Record<string, unknown>, visibility: { is_published: boolean; is_featured: boolean; sort_order: number }) => Promise<void>;
}) {
  const content = item?.content ?? {};
  const [id, setId] = React.useState(field(content, "id"));
  const [title, setTitle] = React.useState(field(content, "title"));
  const [description, setDescription] = React.useState(field(content, "description"));
  const [issuer, setIssuer] = React.useState(field(content, "issuer"));
  const [date, setDate] = React.useState(field(content, "date"));
  const [category, setCategory] = React.useState(field(content, "category", collection === "projects" ? "Fullstack" : "Programming"));
  const [imageUrl, setImageUrl] = React.useState(field(content, "imageUrl"));
  const [link, setLink] = React.useState(field(content, "link"));
  const [technologies, setTechnologies] = React.useState(textList(content.technologies));
  const [features, setFeatures] = React.useState(textList(content.features));
  const [gallery, setGallery] = React.useState(textList(content.gallery));
  const [githubUrl, setGithubUrl] = React.useState(field(content, "githubUrl"));
  const [liveUrl, setLiveUrl] = React.useState(field(content, "liveUrl"));
  const [documentationUrl, setDocumentationUrl] = React.useState(field(content, "documentationUrl"));
  const [isPublished, setIsPublished] = React.useState(item?.is_published ?? true);
  const [isFeatured, setIsFeatured] = React.useState(item?.is_featured ?? false);
  const [showOnCertificatesPage, setShowOnCertificatesPage] = React.useState(content.showOnCertificatesPage !== false);
  const [sortOrder, setSortOrder] = React.useState(item?.sort_order ?? 0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    formData.set("collection", collection);
    setIsUploading(true);
    try {
      const response = await fetch("/api/admin/content/upload", { method: "POST", body: formData });
      const result: unknown = await response.json();
      if (!response.ok) throw new Error(readError(result, "Image upload failed."));
      if (!isRecord(result) || typeof result.imageUrl !== "string") throw new Error("The upload response was invalid.");
      setImageUrl(result.imageUrl);
      await showSuccessToast("Image uploaded");
    } catch (error) {
      console.error("Unable to upload portfolio image:", error);
      await showErrorAlert("Image upload failed", error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setIsUploading(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const normalizedId = (id || title).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const commonContent = collection === "projects"
      ? {
          id: normalizedId,
          title: title.trim(),
          description: description.trim(),
          technologies: splitLines(technologies),
          features: splitLines(features),
          imageUrl: imageUrl.trim(),
          category,
          gallery: splitLines(gallery),
          ...(githubUrl.trim() ? { githubUrl: githubUrl.trim() } : {}),
          ...(liveUrl.trim() ? { liveUrl: liveUrl.trim() } : {}),
          ...(documentationUrl.trim() ? { documentationUrl: documentationUrl.trim() } : {}),
        }
      : {
          id: normalizedId,
          title: title.trim(),
          issuer: issuer.trim(),
          date: date.trim(),
          imageUrl: imageUrl.trim(),
          category,
          ...(link.trim() ? { link: link.trim() } : {}),
          showOnCertificatesPage,
        };
    try {
      await onSave(commonContent, { is_published: isPublished, is_featured: isFeatured, sort_order: sortOrder });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[250] overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="content-editor-title">
      <form onSubmit={submit} className="mx-auto my-6 max-w-2xl space-y-4 rounded-2xl border border-border bg-background p-5 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <h2 id="content-editor-title" className="text-2xl font-bold text-foreground">{item ? "Edit" : "Add"} {collection === "projects" ? "project" : "certificate"}</h2>
          <Button type="button" variant="outline" onClick={onCancel}>Close</Button>
        </div>

        <Field label="Title"><input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} /></Field>
        {collection === "projects" ? (
          <>
            <Field label="Description"><textarea required maxLength={5000} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className={inputClass} /></Field>
            <Field label="Technologies (one per line)"><textarea rows={3} value={technologies} onChange={(event) => setTechnologies(event.target.value)} className={inputClass} /></Field>
            <Field label="Highlights / features (one per line)"><textarea rows={3} value={features} onChange={(event) => setFeatures(event.target.value)} className={inputClass} /></Field>
            <Field label="Category"><select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>{projectCategories.map((entry) => <option key={entry}>{entry}</option>)}</select></Field>
          </>
        ) : (
          <>
            <Field label="Issuer"><input required maxLength={200} value={issuer} onChange={(event) => setIssuer(event.target.value)} className={inputClass} /></Field>
            <Field label="Date or year"><input required maxLength={80} value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} /></Field>
            <Field label="Category"><select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>{certificateCategories.map((entry) => <option key={entry}>{entry}</option>)}</select></Field>
            <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={showOnCertificatesPage} onChange={(event) => setShowOnCertificatesPage(event.target.checked)} /> Show on Certificates page</label>
          </>
        )}

        <Field label="Image URL"><input required maxLength={2048} value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} className={inputClass} placeholder="https://… or /image.png" /></Field>
        <label className="inline-flex cursor-pointer items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
          <ImagePlus className="mr-2 h-4 w-4" /> {isUploading ? "Uploading…" : "Upload image"}
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={isUploading} className="sr-only" onChange={(event) => void uploadImage(event.target.files?.[0])} />
        </label>

        {collection === "projects" ? (
          <>
            <Field label="Gallery image URLs (one per line)"><textarea rows={3} value={gallery} onChange={(event) => setGallery(event.target.value)} className={inputClass} /></Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="GitHub URL"><input maxLength={2048} value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} className={inputClass} /></Field>
              <Field label="Live demo URL"><input maxLength={2048} value={liveUrl} onChange={(event) => setLiveUrl(event.target.value)} className={inputClass} /></Field>
              <Field label="Documentation URL"><input maxLength={2048} value={documentationUrl} onChange={(event) => setDocumentationUrl(event.target.value)} className={inputClass} /></Field>
            </div>
          </>
        ) : (
          <Field label="Credential link (optional)"><input maxLength={2048} value={link} onChange={(event) => setLink(event.target.value)} className={inputClass} /></Field>
        )}

        {item && <p className="text-xs text-muted-foreground">Content ID: {item.id}</p>}
        {!item && <Field label="Content ID (optional; generated from title if empty)"><input maxLength={80} value={id} onChange={(event) => setId(event.target.value)} className={inputClass} /></Field>}
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} /> Published</label>
          {collection === "projects" && <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} /> Feature on homepage</label>}
          <label className="flex items-center gap-2 text-sm text-foreground">Display order <input type="number" min={0} max={10000} value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className="w-24 rounded-md border border-border bg-card px-2 py-1" /></label>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSaving || isUploading}>{isSaving ? "Saving…" : "Save content"}</Button>
        </div>
      </form>
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-sky-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5 text-sm font-medium text-foreground"><span>{label}</span>{children}</label>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readError(value: unknown, fallback: string) {
  return isRecord(value) && typeof value.error === "string" ? value.error : fallback;
}

async function SwalConfirm(message: string) {
  const { default: Swal } = await import("sweetalert2");
  const result = await Swal.fire({
    title: "Delete this item?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    confirmButtonColor: "#dc2626",
    background: "var(--card)",
    color: "var(--foreground)",
  });
  return result.isConfirmed;
}
