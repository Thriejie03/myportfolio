"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Film,
  ImagePlus,
  LoaderCircle,
  MoveUpRight,
  Play,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { Upload as TusUpload } from "tus-js-client";
import { Button } from "@/components/ui/button";
import { showErrorAlert, showSuccessToast } from "@/lib/alerts";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/config";

type SkillVideoItem = {
  id: string;
  content: {
    id?: string;
    title?: string;
    skill?: string;
    description?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
  };
  is_published: boolean;
  sort_order: number;
};

type UploadState = {
  status: "idle" | "uploading" | "complete";
  fileName: string;
  bytesSent: number;
  bytesTotal: number;
};

const inputClass =
  "w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10";
const maximumVideoSize = 500 * 1024 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readError(value: unknown, fallback: string) {
  return isRecord(value) && typeof value.error === "string" ? value.error : fallback;
}

function field(
  content: SkillVideoItem["content"] | undefined,
  key: "title" | "skill" | "description" | "videoUrl" | "thumbnailUrl",
) {
  const value = content?.[key];
  return typeof value === "string" ? value : "";
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resolvePlayback(url: string) {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (youtube) return { kind: "iframe" as const, src: `https://www.youtube.com/embed/${youtube[1]}` };
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { kind: "iframe" as const, src: `https://player.vimeo.com/video/${vimeo[1]}` };
  return { kind: "video" as const, src: url };
}

export function SkillVideoEditor({
  item,
  onCancel,
  onSave,
}: {
  item: SkillVideoItem | null;
  onCancel: () => void;
  onSave: (
    content: Record<string, unknown>,
    visibility: { is_published: boolean; sort_order: number },
  ) => Promise<void>;
}) {
  const reduceMotion = useReducedMotion();
  const existing = item?.content;
  const [title, setTitle] = React.useState(field(existing, "title"));
  const [skill, setSkill] = React.useState(field(existing, "skill"));
  const [description, setDescription] = React.useState(field(existing, "description"));
  const [videoUrl, setVideoUrl] = React.useState(field(existing, "videoUrl"));
  const [thumbnailUrl, setThumbnailUrl] = React.useState(field(existing, "thumbnailUrl"));
  const [published, setPublished] = React.useState(item?.is_published ?? true);
  const [sortOrder, setSortOrder] = React.useState(item?.sort_order ?? 0);
  const [upload, setUpload] = React.useState<UploadState>({
    status: "idle",
    fileName: "",
    bytesSent: 0,
    bytesTotal: 0,
  });
  const [uploadError, setUploadError] = React.useState("");
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const uploadRef = React.useRef<TusUpload | null>(null);
  const cancelUploadRef = React.useRef<(() => void) | null>(null);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelUploadRef.current?.();
    };
  }, []);

  async function uploadVideo(file: File | undefined) {
    if (!file) return;

    const extensionByType: Record<string, string> = {
      "video/mp4": "mp4",
      "video/webm": "webm",
      "video/quicktime": "mov",
    };
    const extension = extensionByType[file.type];
    if (!extension) {
      await showErrorAlert("Choose a supported video", "Use an MP4, WebM, or MOV video file.");
      return;
    }
    if (file.size === 0 || file.size > maximumVideoSize) {
      await showErrorAlert("Video is too large", "Choose a video smaller than 500 MB.");
      return;
    }

    setUploadError("");
    setUpload({ status: "uploading", fileName: file.name, bytesSent: 0, bytesTotal: file.size });

    try {
      const supabase = createSupabaseBrowserClient();
      const config = getSupabaseConfig();
      if (!config) throw new Error("Supabase is not configured.");

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(sessionError.message);
      if (!session?.access_token) throw new Error("Your admin session expired. Sign in again and retry the upload.");

      const objectName = `skill-videos/${crypto.randomUUID()}.${extension}`;
      let uploadedObjectName = objectName;

      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const uploadTask = new TusUpload(file, {
          endpoint: `${config.url.replace(/\/$/, "")}/storage/v1/upload/resumable`,
          chunkSize: 6 * 1024 * 1024,
          retryDelays: [0, 1000, 3000, 5000, 10000],
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          headers: {
            apikey: config.publishableKey,
          },
          metadata: {
            bucketName: "portfolio-media",
            objectName,
            contentType: file.type,
            cacheControl: "31536000",
          },
          onBeforeRequest: async (request) => {
            const { data: { session: refreshedSession }, error } = await supabase.auth.getSession();
            if (error) throw new Error(error.message);
            if (!refreshedSession?.access_token) {
              throw new Error("Your admin session expired. Sign in again and retry the upload.");
            }
            request.setHeader("authorization", `Bearer ${refreshedSession.access_token}`);
          },
          onProgress(bytesSent, bytesTotal) {
            if (mountedRef.current) {
              setUpload({
                status: "uploading",
                fileName: file.name,
                bytesSent,
                bytesTotal,
              });
            }
          },
          onError(error) {
            if (settled) return;
            settled = true;
            reject(error);
          },
          onSuccess() {
            if (settled) return;
            settled = true;
            resolve();
          },
        });
        uploadRef.current = uploadTask;

        cancelUploadRef.current = () => {
          if (settled) return;
          settled = true;
          const canceled = new DOMException("Upload canceled.", "AbortError");
          void uploadTask.abort().then(
            () => reject(canceled),
            () => reject(canceled),
          );
        };

        void uploadTask.findPreviousUploads()
          .then((previousUploads) => {
            if (settled) return;
            if (previousUploads.length > 0) {
              const previousUpload = previousUploads[0];
              if (previousUpload.metadata.objectName) {
                uploadedObjectName = previousUpload.metadata.objectName;
              }
              uploadTask.resumeFromPreviousUpload(previousUpload);
            }
            uploadTask.start();
          })
          .catch((error: unknown) => {
            if (settled) return;
            settled = true;
            reject(error);
          });
      });

      const { data } = supabase.storage.from("portfolio-media").getPublicUrl(uploadedObjectName);
      setVideoUrl(data.publicUrl);
      setUpload({ status: "complete", fileName: file.name, bytesSent: file.size, bytesTotal: file.size });
      await showSuccessToast("Video ready to preview");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        if (mountedRef.current) {
          setUpload({ status: "idle", fileName: "", bytesSent: 0, bytesTotal: 0 });
        }
        return;
      }
      console.error("Unable to upload skill video:", error);
      const message = error instanceof Error ? error.message : "Unable to upload video. Please try again.";
      if (mountedRef.current) {
        setUpload({ status: "idle", fileName: "", bytesSent: 0, bytesTotal: 0 });
        setUploadError(message);
      }
      await showErrorAlert("Video upload failed", message);
    } finally {
      uploadRef.current = null;
      cancelUploadRef.current = null;
    }
  }

  async function uploadThumbnail(file: File | undefined) {
    if (!file) return;
    setIsUploadingThumb(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("collection", "skill-videos");
      const response = await fetch("/api/admin/content/upload", { method: "POST", body: formData });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Thumbnail upload failed."));
      if (!isRecord(data) || typeof data.imageUrl !== "string") throw new Error("The upload response was invalid.");
      setThumbnailUrl(data.imageUrl);
      await showSuccessToast("Thumbnail added");
    } catch (error) {
      await showErrorAlert("Thumbnail upload failed", error instanceof Error ? error.message : "Unable to upload thumbnail.");
    } finally {
      setIsUploadingThumb(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const normalizedId = (existing?.id || title)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

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
      setIsSaving(false);
    }
  }

  const playback = videoUrl.trim() ? resolvePlayback(videoUrl.trim()) : null;
  const uploadPercent = upload.bytesTotal > 0
    ? Math.min(100, Math.round((upload.bytesSent / upload.bytesTotal) * 100))
    : 0;

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (upload.status === "uploading") return;
    void uploadVideo(event.dataTransfer.files[0]);
  }

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      className="fixed inset-0 z-[250] bg-slate-950/75 p-0 backdrop-blur-xl sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="skill-video-editor-title"
    >
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.99 }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
        className="mx-auto flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden border border-white/10 bg-background shadow-2xl sm:h-[min(920px,calc(100dvh-2rem))] sm:rounded-[2rem]"
      >
        <header className="relative flex shrink-0 items-center justify-between gap-3 overflow-hidden border-b border-border px-4 py-4 sm:px-7">
          <div className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl" />
          <div className="relative flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/20">
              <Film className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-slate-950 ring-2 ring-background">
                <Sparkles className="h-2.5 w-2.5" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-500">Creator studio</p>
              <h2 id="skill-video-editor-title" className="truncate text-lg font-bold text-foreground sm:text-xl">
                {item ? "Shape your showcase" : "Make a skill moment"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={upload.status === "uploading" || isSaving}
            aria-label="Close editor"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground transition hover:border-sky-400/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <div className="space-y-6 p-4 sm:p-7">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <span className="rounded-full bg-sky-500/10 px-3 py-1.5 text-sky-500">01 · Add media</span>
                <span className="h-px flex-1 bg-border" />
                <span>02 · Tell the story</span>
              </div>

              <section className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Bring your video</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Drop in a clip or choose one from your device.</p>
                  </div>
                  <span className="hidden rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted-foreground sm:inline-flex">MP4 · WebM · MOV</span>
                </div>

                <label
                  htmlFor="skill-video-file"
                  onDragEnter={(event) => {
                    event.preventDefault();
                    if (upload.status !== "uploading") setIsDragging(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (upload.status === "uploading") event.dataTransfer.dropEffect = "none";
                  }}
                  onDragLeave={(event) => {
                    const nextTarget = event.relatedTarget;
                    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
                      setIsDragging(false);
                    }
                  }}
                  onDrop={handleDrop}
                  className={`group relative flex min-h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed p-5 text-center transition-all duration-300 sm:min-h-48 ${
                    isDragging
                      ? "scale-[1.01] border-sky-400 bg-sky-400/10 shadow-[0_0_40px_rgba(56,189,248,0.15)]"
                      : "border-sky-400/35 bg-gradient-to-br from-sky-500/[0.08] via-card to-indigo-500/[0.07] hover:border-sky-400/70 hover:bg-sky-400/[0.06]"
                  }`}
                >
                  <span className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-sky-400/10 blur-3xl transition group-hover:bg-sky-400/20" />
                  <input
                    id="skill-video-file"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    disabled={upload.status === "uploading"}
                    className="sr-only"
                    onChange={(event) => {
                      void uploadVideo(event.currentTarget.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                  <span className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-500 transition group-hover:scale-110 group-hover:rotate-3">
                    {upload.status === "uploading"
                      ? <LoaderCircle className="h-6 w-6 animate-spin motion-reduce:animate-none" />
                      : upload.status === "complete"
                        ? <Check className="h-6 w-6 text-emerald-500" />
                        : <MoveUpRight className="h-6 w-6" />}
                  </span>
                  <span className="relative text-sm font-semibold text-foreground">
                    {upload.status === "uploading"
                      ? "Sending your video…"
                      : upload.status === "complete"
                        ? "Video uploaded · choose another"
                        : isDragging
                          ? "Drop it here"
                          : "Drop your video here"}
                  </span>
                  <span className="relative mt-1 text-xs text-muted-foreground">
                    or <span className="font-semibold text-sky-500 underline decoration-sky-500/40 underline-offset-4">browse files</span>
                    <span className="block pt-1.5">Up to 500 MB · Your progress is saved as it uploads</span>
                  </span>
                </label>

                {upload.status !== "idle" && (
                  <div className="rounded-2xl border border-border bg-card/80 p-4" aria-live="polite">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        upload.status === "complete" ? "bg-emerald-500/10 text-emerald-500" : "bg-sky-500/10 text-sky-500"
                      }`}>
                        {upload.status === "complete"
                          ? <Check className="h-4 w-4" />
                          : <Video className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">{upload.fileName}</p>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {upload.status === "complete" ? "Ready" : `${uploadPercent}%`}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {upload.status === "complete"
                            ? `${formatBytes(upload.bytesTotal)} uploaded successfully`
                            : `${formatBytes(upload.bytesSent)} of ${formatBytes(upload.bytesTotal)}`}
                        </p>
                        <div
                          className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
                          role="progressbar"
                          aria-label="Video upload progress"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={upload.status === "complete" ? 100 : uploadPercent}
                        >
                          <motion.div
                            className={`h-full rounded-full ${
                              upload.status === "complete"
                                ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                                : "bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400"
                            }`}
                            animate={{ width: `${upload.status === "complete" ? 100 : uploadPercent}%` }}
                            transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                      {upload.status === "uploading" && (
                        <button
                          type="button"
                          onClick={() => cancelUploadRef.current?.()}
                          aria-label="Cancel video upload"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {uploadError && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{uploadError}</p>}

                <div className="relative flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">or use a hosted video</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <label className="block text-xs font-semibold text-foreground">
                  Video link
                  <input
                    type="url"
                    required
                    maxLength={2048}
                    value={videoUrl}
                    onChange={(event) => setVideoUrl(event.target.value)}
                    className={`${inputClass} mt-1.5`}
                    placeholder="Paste a YouTube, Vimeo, or direct video URL"
                  />
                </label>
              </section>

              <section className="space-y-3 rounded-3xl border border-border bg-card/55 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Give it a cover</h3>
                    <p className="mt-1 text-xs text-muted-foreground">A thumbnail makes the gallery feel like yours.</p>
                  </div>
                  {thumbnailUrl && (
                    <button type="button" onClick={() => setThumbnailUrl("")} className="text-xs font-semibold text-muted-foreground hover:text-destructive">
                      Remove
                    </button>
                  )}
                </div>
                {thumbnailUrl ? (
                  <Image src={thumbnailUrl} alt="Selected video thumbnail preview" width={640} height={360} unoptimized className="aspect-video max-h-44 w-full rounded-2xl border border-border object-cover sm:max-w-sm" />
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-background/70 p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500"><ImagePlus className="h-5 w-5" /></span>
                      <span className="text-xs text-muted-foreground">Optional · JPG, PNG, or WebP</span>
                    </div>
                    <label className="inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-border px-3 text-xs font-semibold text-foreground transition hover:border-sky-400/50 hover:bg-sky-400/5">
                      {isUploadingThumb ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" /> : <ImagePlus className="mr-2 h-4 w-4" />}
                      {isUploadingThumb ? "Adding…" : "Choose cover"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={isUploadingThumb}
                        className="sr-only"
                        onChange={(event) => {
                          void uploadThumbnail(event.currentTarget.files?.[0]);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-500">02</span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Tell the story</h3>
                    <p className="text-xs text-muted-foreground">Help visitors know what they are watching.</p>
                  </div>
                </div>
                <label className="block text-xs font-semibold text-foreground">
                  Video title
                  <input required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} className={`${inputClass} mt-1.5`} placeholder="e.g. A quick Canva design walkthrough" />
                </label>
                <label className="block text-xs font-semibold text-foreground">
                  Skill being shown
                  <input required maxLength={120} value={skill} onChange={(event) => setSkill(event.target.value)} className={`${inputClass} mt-1.5`} placeholder="e.g. Graphic Design" />
                </label>
                <label className="block text-xs font-semibold text-foreground">
                  Short description <span className="font-normal text-muted-foreground">(optional)</span>
                  <textarea maxLength={2000} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className={`${inputClass} mt-1.5 resize-y`} placeholder="What should people notice in this video?" />
                </label>
              </section>
            </div>

            <aside className="border-t border-border bg-gradient-to-br from-sky-500/[0.04] via-background to-indigo-500/[0.06] p-4 sm:p-7 lg:overflow-y-auto lg:border-l lg:border-t-0">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-500">03</span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">The visitor view</h3>
                  <p className="text-xs text-muted-foreground">A little preview of the published card.</p>
                </div>
              </div>

              <motion.article
                layout
                className="mt-5 overflow-hidden rounded-[1.75rem] border border-border/80 bg-card shadow-xl shadow-slate-950/5"
              >
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-sky-500/20 via-indigo-500/15 to-violet-500/20">
                  {thumbnailUrl ? (
                    <Image src={thumbnailUrl} alt="" width={640} height={360} unoptimized className="h-full w-full object-cover" />
                  ) : playback?.kind === "iframe" ? (
                    <iframe title="Video preview" src={playback.src} className="pointer-events-none h-full w-full" />
                  ) : playback?.kind === "video" ? (
                    <video src={playback.src} controls preload="metadata" className="h-full w-full object-contain" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-sky-500/80">
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/25 bg-white/35 shadow-lg backdrop-blur">
                        <Play className="ml-1 h-7 w-7 fill-current" />
                        <span className="absolute -right-2 -top-2 h-4 w-4 animate-ping rounded-full bg-sky-400/60 motion-reduce:animate-none" />
                      </div>
                      <span className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em]">Your video preview</span>
                    </div>
                  )}
                  {thumbnailUrl && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-black/35 text-white shadow-lg backdrop-blur">
                        <Play className="ml-1 h-6 w-6 fill-white" />
                      </span>
                    </span>
                  )}
                  <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
                    Skill spotlight
                  </span>
                </div>
                <div className="p-4 sm:p-5">
                  <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-500">
                    <Sparkles className="h-3 w-3 shrink-0" /> {skill.trim() || "Your skill"}
                  </span>
                  <h4 className="mt-3 line-clamp-2 text-lg font-bold text-foreground">{title.trim() || "Your video title"}</h4>
                  <p className="mt-1 line-clamp-3 min-h-10 text-sm leading-relaxed text-muted-foreground">
                    {description.trim() || "Add a short note about what this demonstration is all about."}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span>Thrie Jie · Portfolio</span>
                    <ArrowUpRight className="h-4 w-4 text-sky-500" />
                  </div>
                </div>
              </motion.article>

              <div className="mt-5 rounded-2xl border border-sky-500/15 bg-sky-500/[0.06] p-4">
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500"><Sparkles className="h-4 w-4" /></span>
                  <div>
                    <p className="text-xs font-bold text-foreground">Tiny creator tip</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">A clear title and a short, focused clip make your skill easy to remember.</p>
                  </div>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card/70 p-4">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(event) => setPublished(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-sky-500"
                />
                <span>
                  <span className="block text-xs font-bold text-foreground">Publish to the Skills page</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">Turn this off to save it privately while you work on it.</span>
                </span>
              </label>
              <label className="mt-4 block text-xs font-semibold text-foreground">
                Display order
                <input type="number" min={0} max={10000} value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className={`${inputClass} mt-1.5`} />
              </label>
            </aside>
          </div>

          <footer className="sticky bottom-0 z-10 flex shrink-0 items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:px-7 sm:py-4">
            <p className="hidden text-xs text-muted-foreground sm:block">
              {upload.status === "uploading" ? `Video upload · ${uploadPercent}%` : "Changes are saved to your portfolio"}
            </p>
            <div className="ml-auto flex w-full gap-2 sm:w-auto sm:gap-3">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving || upload.status === "uploading"} className="min-h-11 flex-1 rounded-xl sm:flex-none">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || isUploadingThumb || upload.status === "uploading"} className="min-h-11 flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-blue-500 sm:min-w-40 sm:flex-none">
                {isSaving
                  ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" /> Saving</>
                  : <><Sparkles className="mr-2 h-4 w-4" /> Save video</>}
              </Button>
            </div>
          </footer>
        </form>
      </motion.div>
    </motion.div>
  );
}
