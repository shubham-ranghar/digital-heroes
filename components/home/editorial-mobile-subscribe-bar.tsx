import Link from "next/link";

export function EditorialMobileSubscribeBar() {
  return (
    <div
      data-mobile-subscribe-bar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-cream/95 p-3 shadow-[0_-8px_24px_-16px_rgba(20,33,61,0.2)] backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <Link
        href="/subscribe"
        className="motion-interactive motion-press flex h-12 w-full items-center justify-center rounded-full bg-coral text-base font-medium text-navy active:bg-coral-deep"
      >
        Subscribe now
      </Link>
    </div>
  );
}
