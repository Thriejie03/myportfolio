export interface HomepageStat {
  value: string;
  label: string;
}

export interface HomepageContent {
  hero: {
    greeting: string;
    firstName: string;
    lastName: string;
    role: string;
    summary: string;
    imageUrl: string;
  };
  about: {
    heading: string;
    accentHeading: string;
    description: string;
    stats: HomepageStat[];
  };
  achievement: {
    enabled: boolean;
    title: string;
    highlight: string;
    imageUrl: string;
    imageAlt: string;
    description: string;
    eventName: string;
    date: string;
    certificateUrl: string;
    articleUrl: string;
  };
  cv: {
    label: string;
    url: string;
  };
}

export function mergeHomepageContent(content: Partial<HomepageContent>): HomepageContent {
  return {
    ...defaultHomepageContent,
    ...content,
    hero: { ...defaultHomepageContent.hero, ...content.hero },
    about: { ...defaultHomepageContent.about, ...content.about },
    achievement: { ...defaultHomepageContent.achievement, ...content.achievement },
    cv: { ...defaultHomepageContent.cv, ...content.cv },
  };
}

export const defaultHomepageContent: HomepageContent = {
  hero: {
    greeting: "Hi, I'm",
    firstName: "Thrie Jie",
    lastName: "Barcina",
    role: "BS Information Technology Student (4th Year) | OJT Internship Aspirant",
    summary: "Motivated and flexible Information Technology student seeking an On-the-Job Training (OJT) internship opportunity to apply academic knowledge, develop practical skills, and contribute effectively to organizational goals. Committed to continuous learning, excellence, and delivering quality work in a professional environment.",
    imageUrl: "/profile.png",
  },
  about: {
    heading: "Turning Ideas Into",
    accentHeading: "Real-World Solutions",
    description: "I'm a 4th-year BS Information Technology student at Bukidnon State University with a passion for design, documentation, and technology. I love combining creativity and logic to deliver outputs that are not only functional but also meaningful.",
    stats: [
      { value: "4th", label: "Year BSIT Student" },
      { value: "30+", label: "Skills & Tools" },
      { value: "5", label: "Achievements" },
      { value: "100%", label: "Commitment" },
    ],
  },
  achievement: {
    enabled: true,
    title: "TopCIT Level 2",
    highlight: "(Competent)",
    imageUrl: "/profile.png",
    imageAlt: "Thrie Jie B. Barcina recognized for earning TopCIT Level 2 certification",
    description: "I earned TopCIT Level 2 certification, demonstrating practical competency in information technology. I am also an Academic Achiever, a Dean's Lister from 1st to 4th year, and graduated with High Honors.",
    eventName: "TopCIT Certification",
    date: "2026",
    certificateUrl: "",
    articleUrl: "",
  },
  cv: {
    label: "Download CV",
    url: "",
  },
};
