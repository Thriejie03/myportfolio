"use client";

import * as React from "react";
import { Project } from "@/types/project";
import { motion } from "framer-motion";
import { ExternalLink, ImageIcon, FileText, Video, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick?: () => void;
}

export function ProjectCard({ project, index, onClick }: ProjectCardProps) {
  const [isVideoOpen, setIsVideoOpen] = React.useState(false);
  const isDirectVideo = Boolean(project.videoUrl && /\.(mp4|webm|mov)(?:$|[?#])/i.test(project.videoUrl));
  const hasGallery = Boolean(project.gallery?.length);
  const hasVideo = Boolean(project.videoUrl);

  React.useEffect(() => {
    if (!isVideoOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsVideoOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVideoOpen]);

  function handleCardClick() {
    if (hasVideo) {
      setIsVideoOpen(true);
      return;
    }
    if (hasGallery) onClick?.();
  }

  return (
    <>
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      onClick={handleCardClick}
      className={cn(
        "group relative bg-card rounded-2xl border border-border overflow-hidden hover:border-sky-500/50 transition-all duration-300 flex flex-col h-full shadow-lg",
        (hasGallery || hasVideo) && "cursor-pointer"
      )}
    >
      {/* Project Image */}
      <div className="aspect-[16/10] relative overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent z-10" />
        {project.imageUrl ? (
          <img 
            src={project.imageUrl} 
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold uppercase tracking-tighter text-4xl group-hover:scale-110 transition-transform duration-500">
             {project.title.split(' ').map(w => w[0]).join('')}
          </div>
        )}
        
        {/* Overlay Links */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-sky-500/10 backdrop-blur-[2px]">
           <div className="flex space-x-3">
              {project.liveUrl && (
                <Link href={project.liveUrl} className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                  <ExternalLink className="w-5 h-5" />
                </Link>
              )}
              {project.documentationUrl && (
                <Link 
                  href={project.documentationUrl} 
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                  title="View Documentation"
                >
                  <FileText className="w-5 h-5" />
                </Link>
              )}
              {hasGallery && (
                <div className="w-10 h-10 rounded-full bg-accent/50 backdrop-blur-md text-foreground flex items-center justify-center hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
              {hasVideo && (
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center hover:scale-110 transition-transform" title="Play video">
                  <Video className="w-5 h-5" />
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-sky-400 transition-colors">
          {project.title}
        </h3>
        
        <p className="text-muted-foreground text-xs leading-relaxed mb-6 flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech) => (
            <span key={tech} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-accent/30 px-2 py-1 rounded-md">
              {tech}
            </span>
          ))}
        </div>
      </div>
      </motion.div>

      {isVideoOpen && project.videoUrl && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} video`}
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsVideoOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>
            {isDirectVideo ? (
              <video
                src={project.videoUrl}
                poster={project.videoThumbnailUrl || project.imageUrl || undefined}
                controls
                autoPlay
                playsInline
                className="max-h-[85vh] w-full object-contain"
              />
            ) : (
              <iframe
                src={project.videoUrl}
                title={project.title}
                className="aspect-video w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
