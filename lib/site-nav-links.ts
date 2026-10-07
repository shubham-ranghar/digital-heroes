export type SiteNavLink = {
  href: string;
  label: string;
  external?: boolean;
};

export const menuNavLinks: SiteNavLink[] = [
  { href: "/", label: "Home" },
  { href: "/charities", label: "Charities" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/winners", label: "Winners" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];
