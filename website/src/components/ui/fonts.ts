import { Cormorant_Garamond, EB_Garamond } from "next/font/google";

// Art-direction type pair, latin subset only, only the cuts in use, to keep
// the phone payload small (budget: <=100 KB of font in total).
// Apply `fontVariables` as a className on a wrapper to expose
// --font-display / --font-text (see fontDisplay / fontText in tokens.ts).

export const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300"],
  style: ["italic"],
  display: "swap",
  variable: "--font-display",
});

export const textFont = EB_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-text",
});

export const fontVariables = `${displayFont.variable} ${textFont.variable}`;
