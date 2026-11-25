"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProjectCard } from "@/components/cards/project-card";
import { ProjectGallery } from "@/components/cards/project-gallery";
import { SkillVideos } from "@/components/sections/skill-videos";
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
      
      <section className="pb-24 pt-32">
        <header className="mx-auto mb-10 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-5 text-4xl font-bold text-foreground md:text-6xl">Projects <span className="text-sky-400">&amp; Videos</span></h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Explore Thrie Jie&apos;s projects and watch her skills in action.
          </p>
        </header>

        <div id="skill-videos" className="scroll-mt-24">
          <SkillVideos />
        </div>

        <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-foreground">Projects</h2>
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
