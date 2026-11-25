"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Film, Play, X } from "lucide-react";
import type { SkillVideo } from "@/data/skill-videos";

function resolvePlayback(url: string): { kind: "iframe" | "video"; src: string } {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (youtube) return { kind: "iframe", src: `https://www.youtube.com/embed/${youtube[1]}?autoplay=1` };
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` };
  return { kind: "video", src: url };
}

export function SkillVideos() {
  const reduceMotion = useReducedMotion();
  const [skillVideos, setSkillVideos] = React.useState<SkillVideo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [active, setActive] = React.useState<SkillVideo | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch("/api/content/skill-videos", { cache: "no-store", signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error(`Skill video request failed (${response.status})`);
          return response.json() as Promise<{ skillVideos?: unknown }>;
        })
        .then((data) => {
          if (!Array.isArray(data.skillVideos)) throw new Error("The skill video response was invalid.");
          setSkillVideos(data.skillVideos as SkillVideo[]);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          console.error("Unable to load published skill videos:", error);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  React.useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  if (isLoading) {
    return (
      <section className="relative overflow-hidden py-14 sm:py-20" aria-label="Loading skill videos">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-12">
            <div className="mx-auto mb-4 h-9 w-56 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            <div className="mx-auto h-4 w-72 max-w-full animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="overflow-hidden rounded-3xl border border-border bg-card p-3">
                <div className="aspect-video animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
                <div className="space-y-3 p-4">
                  <div className="h-5 w-1/3 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (skillVideos.length === 0) return null;

  const playback = active ? resolvePlayback(active.videoUrl) : null;

  return (
    <section className="relative overflow-hidden py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-5xl">Skills <span className="text-sky-400">in Action</span></h2>
          <p className="text-muted-foreground">Watch Thrie Jie put her skills to work.</p>
          <p className="mt-2 text-xs text-muted-foreground">Choose a video to watch.</p>
        </div>

        <div className={skillVideos.length === 1
          ? "mx-auto grid w-full max-w-3xl grid-cols-1"
          : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
          {skillVideos.map((video, index) => (
            <motion.button
              key={video.id}
              type="button"
              onClick={() => setActive(video)}
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reduceMotion ? 0 : index * 0.05, duration: reduceMotion ? 0 : 0.3 }}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              className="group overflow-hidden rounded-3xl border border-border bg-card text-left transition-colors hover:border-sky-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-accent/30">
                {video.thumbnailUrl ? (
                  <Image src={video.thumbnailUrl} alt="" width={640} height={360} unoptimized className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sky-400/70">
                    <Film className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg">
                    <Play className="ml-1 h-6 w-6 fill-white" />
                  </span>
                </div>
              </div>
              <div className="p-5">
                {video.skill && (
                  <span className="inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">{video.skill}</span>
                )}
                <h3 className="mt-3 font-semibold text-foreground">{video.title}</h3>
                {video.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{video.description}</p>}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {active && playback && (
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setActive(null)}
        >
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.22 }}
            className="w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                {active.skill && <span className="text-xs font-medium uppercase tracking-wide text-sky-400">{active.skill}</span>}
                <h3 className="truncate text-lg font-semibold text-white">{active.title}</h3>
              </div>
              <button type="button" onClick={() => setActive(null)} aria-label="Close video" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
              {playback.kind === "iframe" ? (
                <iframe
                  src={playback.src}
                  title={active.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={playback.src} controls autoPlay playsInline className="h-full w-full" />
              )}
            </div>
            {active.description && <p className="mt-3 text-sm text-white/70">{active.description}</p>}
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
