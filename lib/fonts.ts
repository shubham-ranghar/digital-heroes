import localFont from "next/font/local";

/** Primary UI / body typeface — Regular (400) and Medium (500). */
export const bagossStandard = localFont({
  src: [
    {
      path: "../public/font/BagossStandard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/font/BagossStandard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-bagoss-standard",
  display: "swap",
  adjustFontFallback: false,
});

/** Editorial accent / serif — Regular (400), typically italic in UI. */
export const austin = localFont({
  src: "../public/font/Austin.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-austin",
  display: "swap",
  adjustFontFallback: false,
});
