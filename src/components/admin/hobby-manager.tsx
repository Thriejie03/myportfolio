"use client";

import * as React from "react";
import { Pencil, Plus, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showErrorAlert, showSuccessToast } from "@/lib/alerts";

type HobbyImage = { src: string; alt: string };
type HobbyItem = {
  id: string;
  content: { id?: string; title?: string; icon?: string; description?: string; accent?: string; images?: HobbyImage[] };
  is_published: boolean;
  sort_order: number;
};

const inputClass = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground";
const accents = [
  "from-sky-500/20 to-cyan-500/20",
  "from-emerald-500/20 to-teal-500/20",
  "from-amber-500/20 to-orange-500/20",
  "from-violet-500/20 to-fuchsia-500/20",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHobbyItem(value: unknown): value is HobbyItem {
  return isRecord(value) && typeof value.id === "string" && isRecord(value.content) &&
    typeof value.is_published === "boolean" && typeof value.sort_order === "number";
}

function readError(value: unknown, fallback: string) {
  return isRecord(value) && typeof value.error === "string" ? value.error : fallback;
}

function field(content: HobbyItem["content"], key: "title" | "icon" | "description" | "accent", fallback = "") {
  return typeof content[key] === "string" ? content[key] : fallback;
}

function images(content: HobbyItem["content"]) {
  return Array.isArray(content.images) ? content.images.filter((image): image is HobbyImage =>
    isRecord(image) && typeof image.src === "string" && typeof image.alt === "string",
  ) : [];
}

export function HobbyManager() {
  const [items, setItems] = React.useState<HobbyItem[]>([]);
  const [editing, setEditing] = React.useState<HobbyItem | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const loadItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/hobbies", { cache: "no-store" });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to load hobbies."));
      if (!isRecord(data) || !Array.isArray(data.items) || !data.items.every(isHobbyItem)) throw new Error("The hobby response was invalid.");
      setItems(data.items);
    } catch (error) {
      console.error("Unable to load hobbies:", error);
      await showErrorAlert("Could not load hobbies", error instanceof Error ? error.message : "Unable to load hobbies.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void loadItems(), 0);
    return () => window.clearTimeout(timer);
  }, [loadItems]);

  async function deleteItem(item: HobbyItem) {
    if (!window.confirm(`Delete "${field(item.content, "title", item.id)}"?`)) return;
    try {
      const response = await fetch(`/api/admin/hobbies?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to delete hobby."));
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      await showSuccessToast("Hobby deleted");
    } catch (error) {
      await showErrorAlert("Could not delete hobby", error instanceof Error ? error.message : "Unable to delete hobby.");
    }
  }

  async function saveItem(content: Record<string, unknown>, visibility: { is_published: boolean; sort_order: number }) {
    try {
      const response = await fetch("/api/admin/hobbies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, ...visibility }),
      });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to save hobby."));
      if (!isRecord(data) || !isHobbyItem(data.item)) throw new Error("The saved hobby response was invalid.");
      const savedItem = data.item;
      setItems((current) => [...current.filter((item) => item.id !== savedItem.id), savedItem].sort((a, b) => a.sort_order - b.sort_order));
      setEditing(null);
      setCreating(false);
      await showSuccessToast("Hobby saved");
    } catch (error) {
      await showErrorAlert("Could not save hobby", error instanceof Error ? error.message : "Unable to save hobby.");
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 pb-24">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Personal Hobbies</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add a hobby, write a short description, and upload its photos for the About page.</p>
        </div>
        <Button type="button" onClick={() => { setEditing(null); setCreating(true); }}><Plus className="mr-2 h-4 w-4" /> Add hobby</Button>
      </div>
      <div className="mb-6 flex items-center gap-2">
        <Button type="button" variant="outline" onClick={() => void loadItems()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
        <span className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "hobby" : "hobbies"}</span>
      </div>
      {loading ? <p className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Loading hobbies…</p> :
        items.length === 0 ? <div className="rounded-2xl border border-border bg-card p-8 text-center"><p className="text-foreground">No hobbies added yet.</p><Button type="button" className="mt-5" onClick={() => setCreating(true)}>Add first hobby</Button></div> :
        <div className="space-y-3">{items.map((item) => <article key={item.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-2xl">{field(item.content, "icon", "✨")}</div>
          <div className="min-w-0 flex-1"><h2 className="font-semibold text-foreground">{field(item.content, "title", item.id)}</h2><p className="text-sm text-muted-foreground">{item.is_published ? "Published" : "Hidden"} · {images(item.content).length} photo(s)</p></div>
          <Button type="button" variant="outline" size="sm" onClick={() => { setEditing(item); setCreating(false); }}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
          <Button type="button" variant="outline" size="sm" className="text-destructive" onClick={() => void deleteItem(item)}><Trash2 className="h-4 w-4" /></Button>
        </article>)}</div>}
      {(creating || editing) && <HobbyEditor item={editing} onCancel={() => { setEditing(null); setCreating(false); }} onSave={saveItem} />}
    </section>
  );
}

function HobbyEditor({ item, onCancel, onSave }: { item: HobbyItem | null; onCancel: () => void; onSave: (content: Record<string, unknown>, visibility: { is_published: boolean; sort_order: number }) => Promise<void> }) {
  const existing = item?.content;
  const [title, setTitle] = React.useState(field(existing ?? {}, "title"));
  const [icon, setIcon] = React.useState(field(existing ?? {}, "icon", "✨"));
  const [description, setDescription] = React.useState(field(existing ?? {}, "description"));
  const [accent, setAccent] = React.useState(field(existing ?? {}, "accent", accents[0]));
  const [photoList, setPhotoList] = React.useState<HobbyImage[]>(images(existing ?? {}));
  const [published, setPublished] = React.useState(item?.is_published ?? true);
  const [sortOrder, setSortOrder] = React.useState(item?.sort_order ?? 0);
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function uploadPhoto(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("collection", "hobbies");
      const response = await fetch("/api/admin/content/upload", { method: "POST", body: formData });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Image upload failed."));
      if (!isRecord(data) || typeof data.imageUrl !== "string") throw new Error("The upload response was invalid.");
      setPhotoList((current) => [...current, { src: data.imageUrl as string, alt: `${title || "Hobby"} photo` }]);
      await showSuccessToast("Photo uploaded");
    } catch (error) {
      await showErrorAlert("Photo upload failed", error instanceof Error ? error.message : "Unable to upload photo.");
    } finally { setUploading(false); }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const normalizedId = (existing?.id || title).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    try {
      await onSave({ id: normalizedId, title: title.trim(), icon: icon.trim() || "✨", description: description.trim(), accent, images: photoList }, { is_published: published, sort_order: sortOrder });
    } finally { setSaving(false); }
  }

  return <div className="fixed inset-0 z-[250] overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true">
    <form onSubmit={submit} className="mx-auto my-6 max-w-2xl space-y-4 rounded-2xl border border-border bg-background p-5 shadow-2xl sm:p-7">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-foreground">{item ? "Edit" : "Add"} hobby</h2><Button type="button" variant="outline" onClick={onCancel}><X className="mr-2 h-4 w-4" /> Close</Button></div>
      <label className="block text-sm font-medium text-foreground">Hobby name<input required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} className={`${inputClass} mt-1`} placeholder="e.g. Chess" /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-foreground">Emoji / icon<input maxLength={20} value={icon} onChange={(event) => setIcon(event.target.value)} className={`${inputClass} mt-1`} /></label><label className="block text-sm font-medium text-foreground">Display order<input type="number" min={0} value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className={`${inputClass} mt-1`} /></label></div>
      <label className="block text-sm font-medium text-foreground">Description<textarea required maxLength={1000} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className={`${inputClass} mt-1`} placeholder="Describe why you enjoy this hobby." /></label>
      <label className="block text-sm font-medium text-foreground">Card color<select value={accent} onChange={(event) => setAccent(event.target.value)} className={`${inputClass} mt-1`}>{accents.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <div><p className="mb-2 text-sm font-medium text-foreground">Photos</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{photoList.map((photo, index) => <div key={`${photo.src}-${index}`} className="relative"><img src={photo.src} alt={photo.alt} className="aspect-[4/3] w-full rounded-lg object-cover" /><button type="button" onClick={() => setPhotoList((current) => current.filter((_, photoIndex) => photoIndex !== index))} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white" aria-label="Remove photo"><X className="h-4 w-4" /></button></div>)}</div><label className="mt-3 inline-flex cursor-pointer items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"><Upload className="mr-2 h-4 w-4" />{uploading ? "Uploading…" : "Upload photo"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} className="sr-only" onChange={(event) => void uploadPhoto(event.target.files?.[0])} /></label></div>
      <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /> Show this hobby on the About page</label>
      <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={saving || uploading}>{saving ? "Saving…" : "Save hobby"}</Button></div>
    </form>
  </div>;
}
