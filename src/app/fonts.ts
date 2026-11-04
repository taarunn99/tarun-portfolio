import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

/**
 * Fonts are defined once here and applied as CSS variables on <html>.
 * All three are OFL and self-hosted by next/font at build time.
 */
export const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
  preload: true,
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
  preload: false,
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-instrument-serif",
  preload: true,
});

export const fontClassNames = `${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`;
