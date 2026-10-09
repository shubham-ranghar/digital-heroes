import type { Charity } from "@/lib/charity/types";

export type CharityPhoto = {
  src: string;
  alt: string;
};

/**
 * Local, India-shot photography (Unsplash License) for causes that have no
 * image of their own yet. One per category, so a fresh database never shows
 * the same photo twice in a row of four.
 */
const CATEGORY_PHOTOS: Record<string, CharityPhoto> = {
  Education: {
    src: "/charities/literacy.webp",
    alt: "A schoolgirl writing in Kannada on a classroom blackboard in Bengaluru",
  },
  Health: {
    src: "/charities/community-health.webp",
    alt: "A care worker dressing a man's arm at a street-side clinic",
  },
  "Hunger & Food": {
    src: "/charities/community-kitchen.webp",
    alt: "Volunteers cooking in large pans at a community langar kitchen",
  },
  "Youth & Sports": {
    src: "/charities/youth-sports.webp",
    alt: "Young people celebrating together on a dusty neighbourhood ground",
  },
};

const PHOTO_POOL: CharityPhoto[] = Object.values(CATEGORY_PHOTOS);

/** Placeholder paths that mean "no real photo uploaded" (old seeds used the hero). */
const PLACEHOLDER_SRCS = new Set(["/hero.webp", "/hero.png"]);

function ownPhoto(charity: Pick<Charity, "name" | "images">): CharityPhoto | null {
  const src = charity.images.find((image) => !PLACEHOLDER_SRCS.has(image));
  return src ? { src, alt: charity.name } : null;
}

/**
 * Photo per charity for a list, in order: the charity's own image, else its
 * category's photo, else the next unused pool photo. No photo repeats within
 * the list while the pool still has unused ones.
 */
export function resolveCharityPhotos(
  charities: Pick<Charity, "id" | "name" | "images" | "category">[],
): Map<string, CharityPhoto> {
  const used = new Set<string>();
  const result = new Map<string, CharityPhoto>();

  const take = (photo: CharityPhoto | null | undefined) => {
    if (!photo || used.has(photo.src)) {
      return null;
    }
    used.add(photo.src);
    return photo;
  };

  for (const charity of charities) {
    const photo =
      take(ownPhoto(charity)) ??
      take(charity.category ? CATEGORY_PHOTOS[charity.category] : undefined) ??
      take(PHOTO_POOL.find((candidate) => !used.has(candidate.src))) ??
      // Pool exhausted (more charities than photos): repeats are unavoidable.
      ownPhoto(charity) ??
      PHOTO_POOL[result.size % PHOTO_POOL.length];
    result.set(charity.id, photo);
  }

  return result;
}
