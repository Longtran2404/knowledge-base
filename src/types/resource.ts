export type Resource = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: "pdf" | "doc" | "guide" | "project";
  field: string;
  accessLevel: "free" | "member" | "premium";
  year: number;
  tags: string[];
  thumbnail?: string;
  createdAt: string;
};
