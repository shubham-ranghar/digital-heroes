/** Public winner display: first name + last initial only. */
export function maskWinnerName(displayName: string | null | undefined): string {
  const trimmed = displayName?.trim();
  if (!trimmed) {
    return "Winner";
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const name = parts[0];
    return name.length > 1 ? `${name[0].toUpperCase()}${name.slice(1)}` : name;
  }

  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() ?? "";
  return `${first} ${lastInitial}.`;
}
