"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Film, Pencil, Play, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showErrorAlert, showSuccessToast } from "@/lib/alerts";
import type { SkillVideo } from "@/data/skill-videos";
import { SkillVideoEditor } from "@/components/admin/skill-video-editor";

type SkillVideoItem = {
  id: string;
  content: Partial<SkillVideo> & { id?: string };
  is_published: boolean;
  sort_order: number;
};

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
  const reduceMotion = useReducedMotion();
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
    <section className="mx-auto max-w-6xl px-4 pb-24">
      <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-sky-500/15 bg-gradient-to-br from-sky-500/[0.11] via-card to-indigo-500/[0.09] p-6 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-500">
            <Film className="h-3.5 w-3.5" /> Skill videos
          </p>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Manage your <span className="bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">videos</span></h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Add short videos that show what you can do. Visitors will see published videos on your Projects page.</p>
        </div>
        <Button type="button" onClick={() => { setEditing(null); setCreating(true); }} className="relative min-h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-blue-500">
          <Plus className="mr-2 h-4 w-4" /> Add a video
        </Button>
        </div>
      </div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Your videos</h2>
          <p className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? "video" : "videos"}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadItems()} disabled={loading} className="rounded-xl">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`} /> Refresh
        </Button>
      </div>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="overflow-hidden rounded-3xl border border-border bg-card p-3">
              <div className="aspect-video animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
              <div className="space-y-3 p-3">
                <div className="h-3 w-1/3 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                <div className="h-5 w-2/3 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-dashed border-sky-500/25 bg-gradient-to-br from-sky-500/[0.07] via-card to-indigo-500/[0.07] px-6 py-14 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-sky-500/10 text-sky-500">
            <Film className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-xl font-bold text-foreground">No videos yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">Add a short clip to show one of your skills. You can choose whether visitors can see it.</p>
          <Button type="button" onClick={() => setCreating(true)} className="mt-6 min-h-11 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add your first video
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item, index) => (
            <motion.article
              key={item.id}
              initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.045 }}
              whileHover={reduceMotion ? undefined : { y: -3 }}
              className="group overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-sky-500/35"
            >
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-sky-500/15 via-indigo-500/10 to-violet-500/15">
            {field(item.content, "thumbnailUrl")
              ? <Image src={field(item.content, "thumbnailUrl")} alt="" width={640} height={360} unoptimized className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              : <div className="flex h-full items-center justify-center text-sky-500/70"><Film className="h-10 w-10" /></div>}
            <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
              {item.is_published ? "Visible to everyone" : "Only you can see this"}
            </span>
            <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg">
              <Play className="ml-0.5 h-4 w-4 fill-white" />
            </span>
          </div>
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="min-w-0 flex-1">
              <span className="inline-flex max-w-full truncate rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-500">{field(item.content, "skill", "Skill")}</span>
              <h3 className="mt-2 truncate text-base font-bold text-foreground">{field(item.content, "title", item.id)}</h3>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{field(item.content, "description", "No description yet.")}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => { setEditing(item); setCreating(false); }} className="min-h-10 flex-1 rounded-xl sm:flex-none">
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button type="button" variant="outline" size="sm" aria-label={`Delete ${field(item.content, "title", item.id)}`} onClick={() => void deleteItem(item)} className="min-h-10 rounded-xl text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
            </motion.article>
          ))}
        </div>
      )}
      {(creating || editing) && <SkillVideoEditor item={editing} onCancel={() => { setEditing(null); setCreating(false); }} onSave={saveItem} />}
    </section>
  );
}
