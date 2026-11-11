export interface SocialLink {
  platform: string;
  label: string;
  url: string;
}

export interface Hobby {
  title: string;
  description: string;
  photoCount: number;
}

export interface Stat {
  label: string;
  value: string;
}

export interface PortfolioRoute {
  key: "home" | "about" | "projects" | "skills" | "certificates" | "contact";
  path: string;
  label: string;
  keywords: string[];
}

export interface DownloadFile {
  key: string;
  label: string;
  url: string;
  description: string;
  keywords: string[];
}

export interface MapLinks {
  embed: string;
  openUrl: string;
  directionsUrl: string;
  title: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
  keywords: string[];
  category: string;
}

export const personalKnowledge = {
  fullName: "Thrie Jie B. Barcina",
  firstName: "Thrie Jie",
  title: "BS Information Technology Student (4th Year) | OJT Internship Aspirant",
  location: "Malaybalay City, Bukidnon, Philippines",
  email: "thriejieb@gmail.com",
  phone: "09268405538",
  degree: "Bachelor of Science in Information Technology, Bukidnon State University – Malaybalay City (2023–2027, expected graduation)",
  objective: "Motivated and flexible Information Technology student seeking an On-the-Job Training (OJT) internship opportunity to apply academic knowledge, develop practical skills, and contribute effectively to organizational goals. Committed to continuous learning, excellence, and delivering quality work in a professional environment.",
  socials: [],
} as const;

export const trainings = [
  "Student Extensionist Program (1st Year)",
  "Student Assistant – University Library (2nd Year)",
  "DEVCON Web Seminars / Vercel App (3rd Year)",
  "International Lecture on AI Ecosystem Seminar (3rd Year)",
] as const;

export const achievements = [
  "Academic Achiever",
  "TopCIT – Level 2",
  "Networking CCNA 1–2",
  "Dean's Lister (1st–4th Year)",
  "With High Honors",
] as const;

export const faq: FaqEntry[] = [
  {
    question: "Who is Thrie Jie B. Barcina?",
    answer: `${personalKnowledge.fullName} is a ${personalKnowledge.title} from ${personalKnowledge.location}.`,
    keywords: ["who is", "about", "Thrie Jie", "BSIT student", "OJT"],
    category: "personal",
  },
  {
    question: "What is Thrie Jie looking for?",
    answer: personalKnowledge.objective,
    keywords: ["OJT", "internship", "opportunity", "looking for", "objective"],
    category: "personal",
  },
  {
    question: "What are Thrie Jie's achievements?",
    answer: `Her achievements include ${achievements.join(", ")}.`,
    keywords: ["achievements", "Academic Achiever", "TopCIT", "CCNA", "Dean's Lister", "High Honors"],
    category: "achievements",
  },
  {
    question: "What training has Thrie Jie completed?",
    answer: `Her trainings and seminars include ${trainings.join("; ")}.`,
    keywords: ["training", "seminars", "Student Extensionist", "Student Assistant", "DEVCON", "AI Ecosystem"],
    category: "training",
  },
  {
    question: "How can I contact Thrie Jie?",
    answer: `You can email ${personalKnowledge.email} or call ${personalKnowledge.phone}. She is based in ${personalKnowledge.location}.`,
    keywords: ["contact", "email", "phone", "reach", "location"],
    category: "contact",
  },
];
