"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Film, Play, X } from "lucide-react";
import { usePublishedContent } from "@/lib/use-published-content";
import type { SkillVideo } from "@/data/skill-videos";

function resolvePlayback(url: string): { kind: "iframe" | "video"; src: string } {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (youtube) return { kind: "iframe", src: `https://www.youtube.com/embed/${youtube[1]}?autoplay=1` };
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` };
  return { kind: "video", src: url };
}

export function SkillVideos() {
  const skillVideos = usePublishedContent<SkillVideo>("/api/content/skill-videos", []);
  const [active, setActive] = React.useState<SkillVideo | null>(null);

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

  if (skillVideos.length === 0) return null;

  const playback = active ? resolvePlayback(active.videoUrl) : null;

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Skill <span className="text-sky-400">Videos</span></h2>
          <p className="text-muted-foreground">Watch Thrie Jie demonstrate her skills in action.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillVideos.map((video, index) => (
            <motion.button
              key={video.id}
              type="button"
              onClick={() => setActive(video)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -6 }}
              className="group overflow-hidden rounded-2xl border border-border bg-card text-left transition-colors hover:border-sky-500/40"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-accent/30">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sky-400/70">
                    <Film className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setActive(null)}
        >
          <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                {active.skill && <span className="text-xs font-medium uppercase tracking-wide text-sky-400">{active.skill}</span>}
                <h3 className="truncate text-lg font-semibold text-white">{active.title}</h3>
              </div>
              <button type="button" onClick={() => setActive(null)} aria-label="Close video" className="shrink-0 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20">
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
          </div>
        </div>
      )}
    </section>
  );
}
