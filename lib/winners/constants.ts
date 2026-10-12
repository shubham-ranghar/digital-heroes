export const WINNER_PROOFS_BUCKET = "winner-proofs";

/** Under Vercel's 4.5MB request cap, leaving room for multipart overhead. */
export const PROOF_MAX_BYTES = 4 * 1024 * 1024;

export const PROOF_ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);
