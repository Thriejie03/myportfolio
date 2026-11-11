import { achievements, faq, personalKnowledge, trainings, type FaqEntry } from "@/data/knowledge-base";

export const DEVELOPER_DATA = {
  ...personalKnowledge,
  achievements,
  trainings,
  coreCompetencies: [
    "Communication",
    "Attention to Detail",
    "Teamwork & Collaboration",
    "Project Management (Team Leader)",
    "Tech-Savvy",
    "Willingness to Learn",
    "Computer & AI Literacy",
    "Organizational Skills",
    "Documentation",
    "Presentation & Pitching",
    "Technical Writing",
    "Proofreading",
    "Graphic Design",
    "UI/UX Design",
    "Video Editing",
  ],
} as const;

export const FAQ: FaqEntry[] = [
  {
    question: "What degree is Thrie Jie pursuing?",
    answer: personalKnowledge.degree,
    keywords: ["degree", "course", "BSIT", "Bukidnon State University", "education"],
    category: "education",
  },
  ...faq,
];
