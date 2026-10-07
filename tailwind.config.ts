import type { Config } from "tailwindcss";

/**
 * Digital Heroes design tokens (mirrors CSS variables in app/globals.css).
 * Tailwind v4 reads theme extensions here via `@config` in globals.css.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7F0",
        surface: "#FFFFFF",
        sand: "#EDE6DA",
        navy: "#14213D",
        slate: "#5B6275",
        coral: {
          DEFAULT: "#F2542D",
          deep: "#D9441F",
        },
        line: "#E2DACB",
        "status-active": "#1F7A8C",
        "status-pending": "#C98A00",
        "status-danger": "#C0392B",
        "on-surface": "var(--on-surface)",
        "muted-on-surface": "var(--muted-on-surface)",
        "placeholder-on-surface": "var(--placeholder-on-surface)",
        "on-dark": "var(--on-dark)",
        "muted-on-dark": "var(--muted-on-dark)",
        "input-on-surface": "var(--input-on-surface)",
      },
      fontFamily: {
        sans: ["var(--font-bagoss-standard)"],
        serif: ["var(--font-austin)"],
      },
      fontWeight: {
        light: "400",
        normal: "400",
        medium: "500",
        semibold: "500",
        bold: "500",
        extrabold: "500",
        black: "500",
      },
      borderRadius: {
        card: "20px",
        pill: "9999px",
      },
      boxShadow: {
        "card-hover": "0 12px 40px -12px rgba(20, 33, 61, 0.12)",
      },
      letterSpacing: {
        tightish: "-0.02em",
      },
    },
  },
};

export default config;
