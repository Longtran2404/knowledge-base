export type Product = {
  id: string;
  slug: string;
  title: string;
  type: "tool" | "book" | "software" | "bundle";
  price: number;
  compareAtPrice?: number;
  currency: "VND" | "USD";
  domain: string;
  year: number;
  tags: string[];
  isHot?: boolean;
  ratingAvg?: number;
  ratingCount?: number;
  thumbnail?: string;
  createdAt: string;
};