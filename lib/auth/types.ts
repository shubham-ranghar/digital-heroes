export type AuthActionResult = {
  ok: boolean;
  message?: string;
  /** Set when signup succeeds but email confirmation is required. */
  confirmEmail?: boolean;
  fieldErrors?: Partial<Record<string, string>>;
};
