import { WINNER_PROOFS_BUCKET } from "@/lib/winners/constants";

export function buildProofStoragePath(
  userId: string,
  winnerId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${userId}/${winnerId}/${Date.now()}-${safeName}`;
}

export function proofBucket() {
  return WINNER_PROOFS_BUCKET;
}
