export interface Skill {
  name: string;
  category: "Frontend" | "Backend" | "Database" | "Tools" | "IoT/Hardware" | "Deployment" | "Mobile" | "Desktop";
  icon?: string;
}

export const skills: Skill[] = [
  { name: "Communication", category: "Tools" },
  { name: "Attention to Detail", category: "Tools" },
  { name: "Teamwork & Collaboration", category: "Tools" },
  { name: "Project Management (Team Leader)", category: "Tools" },
  { name: "Tech-Savvy", category: "Tools" },
  { name: "Willingness to Learn", category: "Tools" },
  { name: "Computer & AI Literacy", category: "Tools" },
  { name: "Organizational Skills", category: "Tools" },
  { name: "Documentation", category: "Tools" },
  { name: "Presentation & Pitching", category: "Tools" },
  { name: "Technical Writing", category: "Tools" },
  { name: "Proofreading", category: "Tools" },
  { name: "Graphic Design", category: "Frontend" },
  { name: "UI/UX Design", category: "Frontend" },
  { name: "Video Editing", category: "Tools" },
  { name: "Microsoft Office (Word, Excel, PowerPoint)", category: "Desktop" },
  { name: "Google Workspace (Docs, Sheets, Drive)", category: "Tools" },
  { name: "Canva (Graphic Design, Pubmats, Logos, Flyers)", category: "Frontend" },
  { name: "Basic Data Entry & Documentation", category: "Desktop" },
  { name: "Email & File Management", category: "Tools" },
  { name: "CapCut (Video Editing)", category: "Tools" },
  { name: "Internet Research & Navigation", category: "Tools" },
  { name: "PDF Editing & Conversion", category: "Tools" },
  { name: "Online Collaboration Tools (Zoom, Google Meet, Discord)", category: "Tools" },
  { name: "File Organization & Cloud Storage", category: "Tools" },
  { name: "Basic Presentation Creation", category: "Tools" },
  { name: "AI Tools (Video Making)", category: "Tools" },
];
