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
      },
      fontFamily: {
        sans: ["var(--font-inter-tight)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
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
