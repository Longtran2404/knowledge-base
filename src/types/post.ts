export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  thumbnail?: string;
  tags?: string[];
  createdAt: string;
};