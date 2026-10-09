type MemberLabelProps = {
  userId: string;
  name: string | null | undefined;
  email: string | null | undefined;
};

/** Who a row belongs to: display name over email; id prefix only if both are missing. */
export function MemberLabel({ userId, name, email }: MemberLabelProps) {
  const primary = name || email || `${userId.slice(0, 8)}…`;
  const secondary = name && email ? email : null;

  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate text-navy">{primary}</span>
      {secondary ? (
        <span className="truncate text-xs text-slate">{secondary}</span>
      ) : null}
    </span>
  );
}
