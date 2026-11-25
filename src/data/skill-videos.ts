export interface SkillVideo {
  id: string;
  title: string;
  skill: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export const skillVideos: SkillVideo[] = [];
