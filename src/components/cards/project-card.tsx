"use client";

import { Project } from "@/types/project";
import { motion } from "framer-motion";
import { ExternalLink, ArrowRight, ImageIcon, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick?: () => void;
}

export function ProjectCard({ project, index, onClick }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      onClick={onClick}
      className={cn(
        "group relative bg-card rounded-2xl border border-border overflow-hidden hover:border-sky-500/50 transition-all duration-300 flex flex-col h-full shadow-lg",
        project.gallery && "cursor-pointer"
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
              {project.gallery && (
                <div className="w-10 h-10 rounded-full bg-accent/50 backdrop-blur-md text-foreground flex items-center justify-center hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5" />
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
  );
}
