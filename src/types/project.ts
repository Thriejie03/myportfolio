export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  features: string[];
  imageUrl: string;
  githubUrl?: string;
  liveUrl?: string;
  documentationUrl?: string;
  category: "Fullstack" | "Frontend" | "Backend" | "IoT" | "Game Dev" | "Desktop";
  gallery?: string[];
  isFeatured?: boolean;
}
