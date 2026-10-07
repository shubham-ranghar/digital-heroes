import { cn } from "@/lib/utils";

type CharityImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/** External charity image URLs (not configured in next/image remote patterns). */
export function CharityImage({ src, alt, className }: CharityImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("object-cover", className)}
      loading="lazy"
      decoding="async"
    />
  );
}
