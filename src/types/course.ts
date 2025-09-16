export type Course = {
  id: string;
  slug: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  domain: string;
  year: number;
  tags: string[];
  ratingAvg?: number;
  ratingCount?: number;
  thumbnail?: string;
  price?: number;
  isHot?: boolean;
  createdAt: string;
};
