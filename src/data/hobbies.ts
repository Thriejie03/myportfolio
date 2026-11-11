export interface HobbyImage {
  src: string;
  alt: string;
}

export interface Hobby {
  id: string;
  title: string;
  icon: string;
  description: string;
  images: HobbyImage[];
  accent: string;
}

export const hobbies: Hobby[] = [];
