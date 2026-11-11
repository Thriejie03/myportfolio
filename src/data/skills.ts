export interface Skill {
  name: string;
  category:
    | "Office & Productivity"
    | "Communication & Collaboration"
    | "Design & Media"
    | "Documentation & Organization"
    | "Digital & AI Literacy";
  icon?: string;
}

export const skills: Skill[] = [
  { name: "Microsoft Office (Word, Excel, PowerPoint)", category: "Office & Productivity" },
  { name: "Google Workspace (Docs, Sheets, Drive)", category: "Office & Productivity" },
  { name: "Basic Presentation Creation", category: "Office & Productivity" },
  { name: "Communication", category: "Communication & Collaboration" },
  { name: "Teamwork & Collaboration", category: "Communication & Collaboration" },
  { name: "Project Management (Team Leader)", category: "Communication & Collaboration" },
  { name: "Presentation & Pitching", category: "Communication & Collaboration" },
  { name: "Online Collaboration Tools (Zoom, Google Meet, Discord)", category: "Communication & Collaboration" },
  { name: "Graphic Design", category: "Design & Media" },
  { name: "UI/UX Design", category: "Design & Media" },
  { name: "Canva (Graphic Design, Pubmats, Logos, Flyers)", category: "Design & Media" },
  { name: "Video Editing", category: "Design & Media" },
  { name: "CapCut (Video Editing)", category: "Design & Media" },
  { name: "Attention to Detail", category: "Documentation & Organization" },
  { name: "Documentation", category: "Documentation & Organization" },
  { name: "Technical Writing", category: "Documentation & Organization" },
  { name: "Proofreading", category: "Documentation & Organization" },
  { name: "Organizational Skills", category: "Documentation & Organization" },
  { name: "Basic Data Entry & Documentation", category: "Documentation & Organization" },
  { name: "Email & File Management", category: "Documentation & Organization" },
  { name: "File Organization & Cloud Storage", category: "Documentation & Organization" },
  { name: "Tech-Savvy", category: "Digital & AI Literacy" },
  { name: "Computer & AI Literacy", category: "Digital & AI Literacy" },
  { name: "Willingness to Learn", category: "Digital & AI Literacy" },
  { name: "Internet Research & Navigation", category: "Digital & AI Literacy" },
  { name: "PDF Editing & Conversion", category: "Digital & AI Literacy" },
  { name: "AI Tools (Video Making)", category: "Digital & AI Literacy" },
];
