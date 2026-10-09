import { unstable_rethrow } from "next/navigation";

export type ActionFailure = { ok: false; message: string };

/**
 * Turns an unexpected error inside a server action into `{ ok: false }`
 * instead of a throw that crashes the calling page.
 *
 * Next's own control-flow errors (`redirect()`, `notFound()`) are rethrown
 * first, so auth redirects still work if they end up inside the `try`.
 * `exposeMessage` passes the raw error text through: use it for admin-only
 * actions (e.g. it names a missing SUPABASE_SERVICE_ROLE_KEY), never for
 * member-facing ones.
 */
export function actionFailure(
  error: unknown,
  doing: string,
  options: { exposeMessage?: boolean } = {},
): ActionFailure {
  unstable_rethrow(error);
  console.error(`Server action failed while trying to ${doing}:`, error);

  if (options.exposeMessage && error instanceof Error && error.message) {
    return { ok: false, message: `Could not ${doing}: ${error.message}` };
  }
  return {
    ok: false,
    message: `We could not ${doing} right now. Please try again in a moment.`,
  };
}
