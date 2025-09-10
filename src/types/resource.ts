export type Resource = {
  id: string;
  slug: string;
  title: string;
  type: "pdf" | "doc" | "guide" | "project";
  access: "free" | "member" | "paid";
  domain: string;
  year: number;
  tags: string[];
  thumbnail?: string;
  createdAt: string;
};