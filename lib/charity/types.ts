export type Charity = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  category: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type CharityEvent = {
  id: string;
  charity_id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  created_at: string;
  updated_at: string;
};

export function parseCharityImages(images: unknown): string[] {
  if (!Array.isArray(images)) {
    return [];
  }
  return images.filter((item): item is string => typeof item === "string");
}
