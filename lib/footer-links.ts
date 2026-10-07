import type { SiteNavLink } from "@/lib/site-nav-links";

export type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

export type FooterColumn = {
  label: string;
  links: FooterLink[];
};

const SOCIAL_ENV_KEYS: { key: string; label: string }[] = [
  { key: "NEXT_PUBLIC_SOCIAL_LINKEDIN_URL", label: "LinkedIn" },
  { key: "NEXT_PUBLIC_SOCIAL_FACEBOOK_URL", label: "Facebook" },
  { key: "NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL", label: "Instagram" },
  { key: "NEXT_PUBLIC_SOCIAL_YOUTUBE_URL", label: "YouTube" },
];

export function getSocialFooterLinks(): FooterLink[] {
  return SOCIAL_ENV_KEYS.flatMap(({ key, label }) => {
    const href = process.env[key]?.trim();
    if (!href) {
      return [];
    }
    return [{ href, label, external: true }];
  });
}

export function buildFooterColumns(isLoggedIn: boolean): FooterColumn[] {
  const supportLinks: FooterLink[] = [
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ];

  const playLinks: FooterLink[] = [
    { href: "/how-it-works#how-you-win", label: "How you win" },
    { href: "/how-it-works#prize-pools", label: "Prize pools" },
    { href: "/how-it-works#draw-rules", label: "Draw rules" },
    { href: "/winners", label: "Winners" },
  ];

  const columns: FooterColumn[] = [
    {
      label: "Browse",
      links: [
        { href: "/", label: "Home" },
        { href: "/how-it-works", label: "How it works" },
        { href: "/charities", label: "Charities" },
        { href: "/subscribe", label: "Subscribe" },
        isLoggedIn
          ? { href: "/dashboard", label: "Dashboard" }
          : { href: "/login", label: "Login" },
      ],
    },
    {
      label: "Play",
      links: playLinks,
    },
    {
      label: "Support",
      links: supportLinks,
    },
  ];

  const social = getSocialFooterLinks();
  if (social.length > 0) {
    columns.push({
      label: "Follow us",
      links: social,
    });
  }

  return columns.filter((column) => column.links.length > 0);
}

export type FooterContactBlock =
  | { kind: "full"; email: string; addressLines: string[] }
  | { kind: "emailOnly"; email: string }
  | { kind: "fallback" };

export function getFooterContactBlock(): FooterContactBlock {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  const address = process.env.NEXT_PUBLIC_CONTACT_ADDRESS?.trim();

  const addressLines = address
    ? address
        .split("|")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  if (email && addressLines.length > 0) {
    return { kind: "full", email, addressLines };
  }

  if (email) {
    return { kind: "emailOnly", email };
  }

  return { kind: "fallback" };
}

export type { SiteNavLink };
