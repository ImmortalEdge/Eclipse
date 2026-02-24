import { Geist, Geist_Mono, Instrument_Serif, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import SelectionMenu from "@/components/SelectionMenu";
import { LanguageProvider } from "@/components/LanguageProvider";

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

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  weight: ["300", "400", "500", "600", "700"],
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
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${cormorantGaramond.variable} antialiased`}
      >
        <LanguageProvider>
          <SelectionMenu />
          <main className="md:ml-[50px]">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
