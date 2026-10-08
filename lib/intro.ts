/** Entry route that gets the first-load intro (`IntroWipe`). */
export const INTRO_PATH = "/";

const INTRO_SEEN_KEY = "dh:intro-seen";

/**
 * If the app hasn't hydrated this long after the cover went up, CSS fades the
 * cover out so the page is never held hostage; the client then skips the
 * intro rather than re-cover it.
 */
export const INTRO_FAILSAFE_MS = 2500;

declare global {
  interface Window {
    /** Set by `INTRO_SCRIPT`: when this document load put the cover up. */
    __dhIntro?: number;
  }
}

/**
 * Render-blocking `<head>` script: decides before first paint whether the
 * server-rendered cover shows (`html[data-intro="play"]`), so there is no
 * flash and no hydration mismatch. Once per tab session, landing page only,
 * never with reduced motion. If storage is unavailable it still plays; client
 * navigations can't replay it either way.
 */
export const INTRO_SCRIPT = `(function(){try{if(location.pathname!==${JSON.stringify(
  INTRO_PATH,
)}||matchMedia("(prefers-reduced-motion: reduce)").matches||sessionStorage.getItem(${JSON.stringify(
  INTRO_SEEN_KEY,
)}))return;sessionStorage.setItem(${JSON.stringify(
  INTRO_SEEN_KEY,
)},"1")}catch(e){}window.__dhIntro=performance.now();document.documentElement.setAttribute("data-intro","play")})()`;
