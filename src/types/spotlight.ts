export type SpotlightItem = {
  id: string;
  refType: "product" | "course" | "collab" | "post";
  refId: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  pinned?: boolean;
  isHot?: boolean;
  priority?: number;
  startAt?: string;
  endAt?: string;
  createdAt: string;
};