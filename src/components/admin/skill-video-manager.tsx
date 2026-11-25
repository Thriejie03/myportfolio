"use client";

import * as React from "react";
import { ImagePlus, Pencil, Play, Plus, RefreshCw, Trash2, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showErrorAlert, showSuccessToast } from "@/lib/alerts";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SkillVideo } from "@/data/skill-videos";

type SkillVideoItem = {
  id: string;
  content: Partial<SkillVideo> & { id?: string };
  is_published: boolean;
  sort_order: number;
};

const inputClass = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSkillVideoItem(value: unknown): value is SkillVideoItem {
  return isRecord(value) && typeof value.id === "string" && isRecord(value.content) &&
    typeof value.is_published === "boolean" && typeof value.sort_order === "number";
}

function readError(value: unknown, fallback: string) {
  return isRecord(value) && typeof value.error === "string" ? value.error : fallback;
}

function field(content: SkillVideoItem["content"], key: "title" | "skill" | "description" | "videoUrl" | "thumbnailUrl", fallback = "") {
  const value = content[key];
  return typeof value === "string" ? value : fallback;
}

export function SkillVideoManager() {
  const [items, setItems] = React.useState<SkillVideoItem[]>([]);
  const [editing, setEditing] = React.useState<SkillVideoItem | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const loadItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/skill-videos", { cache: "no-store" });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to load skill videos."));
      if (!isRecord(data) || !Array.isArray(data.items) || !data.items.every(isSkillVideoItem)) throw new Error("The skill video response was invalid.");
      setItems(data.items);
    } catch (error) {
      console.error("Unable to load skill videos:", error);
      await showErrorAlert("Could not load skill videos", error instanceof Error ? error.message : "Unable to load skill videos.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void loadItems(), 0);
    return () => window.clearTimeout(timer);
  }, [loadItems]);

  async function deleteItem(item: SkillVideoItem) {
    if (!window.confirm(`Delete "${field(item.content, "title", item.id)}"?`)) return;
    try {
      const response = await fetch(`/api/admin/skill-videos?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to delete skill video."));
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      await showSuccessToast("Skill video deleted");
    } catch (error) {
      await showErrorAlert("Could not delete skill video", error instanceof Error ? error.message : "Unable to delete skill video.");
    }
  }

  async function saveItem(content: Record<string, unknown>, visibility: { is_published: boolean; sort_order: number }) {
    try {
      const response = await fetch("/api/admin/skill-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, ...visibility }),
      });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to save skill video."));
      if (!isRecord(data) || !isSkillVideoItem(data.item)) throw new Error("The saved skill video response was invalid.");
      const savedItem = data.item;
      setItems((current) => [...current.filter((item) => item.id !== savedItem.id), savedItem].sort((a, b) => a.sort_order - b.sort_order));
      setEditing(null);
      setCreating(false);
      await showSuccessToast("Skill video saved");
    } catch (error) {
      await showErrorAlert("Could not save skill video", error instanceof Error ? error.message : "Unable to save skill video.");
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 pb-24">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Skill Videos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Upload a short video per skill to showcase it on the Skills page.</p>
        </div>
        <Button type="button" onClick={() => { setEditing(null); setCreating(true); }}><Plus className="mr-2 h-4 w-4" /> Add skill video</Button>
      </div>
      <div className="mb-6 flex items-center gap-2">
        <Button type="button" variant="outline" onClick={() => void loadItems()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
        <span className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "video" : "videos"}</span>
      </div>
      {loading ? <p className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Loading skill videos…</p> :
        items.length === 0 ? <div className="rounded-2xl border border-border bg-card p-8 text-center"><p className="text-foreground">No skill videos added yet.</p><Button type="button" className="mt-5" onClick={() => setCreating(true)}>Add first skill video</Button></div> :
        <div className="space-y-3">{items.map((item) => <article key={item.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-accent/40">
            {field(item.content, "thumbnailUrl")
              ? <img src={field(item.content, "thumbnailUrl")} alt="" className="h-full w-full object-cover" />
              : <Play className="h-6 w-6 text-sky-400" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold text-foreground">{field(item.content, "title", item.id)}</h2>
            <p className="truncate text-sm text-muted-foreground">{field(item.content, "skill") && `${field(item.content, "skill")} · `}{item.is_published ? "Published" : "Hidden"}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => { setEditing(item); setCreating(false); }}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
          <Button type="button" variant="outline" size="sm" className="text-destructive" onClick={() => void deleteItem(item)}><Trash2 className="h-4 w-4" /></Button>
        </article>)}</div>}
      {(creating || editing) && <SkillVideoEditor item={editing} onCancel={() => { setEditing(null); setCreating(false); }} onSave={saveItem} />}
    </section>
  );
}

function SkillVideoEditor({ item, onCancel, onSave }: { item: SkillVideoItem | null; onCancel: () => void; onSave: (content: Record<string, unknown>, visibility: { is_published: boolean; sort_order: number }) => Promise<void> }) {
  const existing = item?.content;
  const [title, setTitle] = React.useState(field(existing ?? {}, "title"));
  const [skill, setSkill] = React.useState(field(existing ?? {}, "skill"));
  const [description, setDescription] = React.useState(field(existing ?? {}, "description"));
  const [videoUrl, setVideoUrl] = React.useState(field(existing ?? {}, "videoUrl"));
  const [thumbnailUrl, setThumbnailUrl] = React.useState(field(existing ?? {}, "thumbnailUrl"));
  const [published, setPublished] = React.useState(item?.is_published ?? true);
  const [sortOrder, setSortOrder] = React.useState(item?.sort_order ?? 0);
  const [uploadingVideo, setUploadingVideo] = React.useState(false);
  const [uploadingThumb, setUploadingThumb] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function uploadVideo(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      await showErrorAlert("Video upload failed", "Choose an MP4, WebM, or MOV video.");
      return;
    }
    setUploadingVideo(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const extension = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `skill-videos/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("portfolio-media")
        .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from("portfolio-media").getPublicUrl(path);
      setVideoUrl(data.publicUrl);
      await showSuccessToast("Video uploaded");
    } catch (error) {
      console.error("Unable to upload skill video:", error);
      await showErrorAlert("Video upload failed", error instanceof Error ? error.message : "Use a hosted video link if the file is too large.");
    } finally {
      setUploadingVideo(false);
    }
  }

  async function uploadThumbnail(file: File | undefined) {
    if (!file) return;
    setUploadingThumb(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("collection", "skill-videos");
      const response = await fetch("/api/admin/content/upload", { method: "POST", body: formData });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Image upload failed."));
      if (!isRecord(data) || typeof data.imageUrl !== "string") throw new Error("The upload response was invalid.");
      setThumbnailUrl(data.imageUrl);
      await showSuccessToast("Thumbnail uploaded");
    } catch (error) {
      await showErrorAlert("Thumbnail upload failed", error instanceof Error ? error.message : "Unable to upload thumbnail.");
    } finally {
      setUploadingThumb(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const normalizedId = (existing?.id || title).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    try {
      await onSave({
        id: normalizedId,
        title: title.trim(),
        skill: skill.trim(),
        description: description.trim(),
        videoUrl: videoUrl.trim(),
        ...(thumbnailUrl.trim() ? { thumbnailUrl: thumbnailUrl.trim() } : {}),
      }, { is_published: published, sort_order: sortOrder });
    } finally {
      setSaving(false);
    }
  }

  return <div className="fixed inset-0 z-[250] overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true">
    <form onSubmit={submit} className="mx-auto my-6 max-w-2xl space-y-4 rounded-2xl border border-border bg-background p-5 shadow-2xl sm:p-7">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-foreground">{item ? "Edit" : "Add"} skill video</h2><Button type="button" variant="outline" onClick={onCancel}><X className="mr-2 h-4 w-4" /> Close</Button></div>
      <label className="block text-sm font-medium text-foreground">Title<input required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} className={`${inputClass} mt-1`} placeholder="e.g. Canva design walkthrough" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-foreground">Skill<input required maxLength={120} value={skill} onChange={(event) => setSkill(event.target.value)} className={`${inputClass} mt-1`} placeholder="e.g. Canva (Graphic Design)" /></label>
        <label className="block text-sm font-medium text-foreground">Display order<input type="number" min={0} value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className={`${inputClass} mt-1`} /></label>
      </div>
      <label className="block text-sm font-medium text-foreground">Description (optional)<textarea maxLength={2000} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className={`${inputClass} mt-1`} placeholder="Briefly describe what the video shows." /></label>

      <div className="space-y-3 rounded-xl border border-border bg-card/60 p-4">
        <div>
          <h3 className="font-semibold text-foreground">Video</h3>
          <p className="mt-1 text-xs text-muted-foreground">Upload an MP4, WebM, or MOV up to 500 MB, or paste a hosted YouTube/Vimeo/direct link.</p>
        </div>
        <label className="block text-sm font-medium text-foreground">Video URL<input required maxLength={2048} value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} className={`${inputClass} mt-1`} placeholder="https://…/video.mp4 or YouTube/Vimeo link" /></label>
        <label className="inline-flex cursor-pointer items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
          <Video className="mr-2 h-4 w-4" /> {uploadingVideo ? "Uploading…" : "Upload video"}
          <input type="file" accept="video/mp4,video/webm,video/quicktime" disabled={uploadingVideo} className="sr-only" onChange={(event) => void uploadVideo(event.target.files?.[0])} />
        </label>
        {videoUrl.trim() && <video src={videoUrl.trim()} controls preload="metadata" className="max-h-56 w-full rounded-lg border border-border bg-black" />}
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card/60 p-4">
        <div>
          <h3 className="font-semibold text-foreground">Thumbnail (optional)</h3>
          <p className="mt-1 text-xs text-muted-foreground">Shown on the card before the video plays.</p>
        </div>
        <label className="block text-sm font-medium text-foreground">Thumbnail URL<input maxLength={2048} value={thumbnailUrl} onChange={(event) => setThumbnailUrl(event.target.value)} className={`${inputClass} mt-1`} placeholder="https://… or /image.png" /></label>
        <label className="inline-flex cursor-pointer items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
          <ImagePlus className="mr-2 h-4 w-4" /> {uploadingThumb ? "Uploading…" : "Upload thumbnail"}
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingThumb} className="sr-only" onChange={(event) => void uploadThumbnail(event.target.files?.[0])} />
        </label>
        {thumbnailUrl.trim() && <img src={thumbnailUrl.trim()} alt="" className="aspect-video w-40 rounded-lg border border-border object-cover" />}
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /> Show this video on the Skills page</label>
      <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={saving || uploadingVideo || uploadingThumb}>{saving ? "Saving…" : "Save skill video"}</Button></div>
    </form>
  </div>;
}
