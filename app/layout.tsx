import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SelectionMenu from "@/components/SelectionMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"]
});

export const metadata = {
  title: "Eclipse — Intelligence Horizon",
  description: "Eclipse is an AI-powered search engine with an editorial voice. Investigate anything.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <SelectionMenu />
        {children}
      </body>
    </html>
  );
}
