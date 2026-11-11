"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProjectCard } from "@/components/cards/project-card";
import { ProjectGallery } from "@/components/cards/project-gallery";
import { projects } from "@/data/projects";
import { Project } from "@/types/project";
import { usePublishedContent } from "@/lib/use-published-content";
import { AIChatbot } from "@/components/chatbot/chatbot";

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const publishedProjects = usePublishedContent<Project>("/api/content/projects", projects);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">All <span className="text-sky-400">Projects</span></h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive list of my work, including web applications, desktop software, and hardware projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedProjects.map((project, index) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                index={index} 
                onClick={() => project.gallery && setSelectedProject(project)}
              />
            ))}
          </div>
          {publishedProjects.length === 0 && (
            <p className="mt-8 text-center text-muted-foreground">Projects will be added here soon.</p>
          )}
        </div>
      </section>

      {/* Project Gallery Modal */}
      {selectedProject && selectedProject.gallery && (
        <ProjectGallery 
          isOpen={!!selectedProject} 
          onClose={() => setSelectedProject(null)} 
          images={selectedProject.gallery}
          projectTitle={selectedProject.title}
        />
      )}

      <Footer />
      <AIChatbot />
    </main>
  );
}
