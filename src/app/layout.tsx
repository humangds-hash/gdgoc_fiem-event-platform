import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Study Jams Info Session 2026–27 · TinyGD",
  description: "Official community orientation for Cloud Study Jams 2026-27 by TinyGD Developer Ecosystem at Future Institute of Engineering & Management, Kolkata.",
  openGraph: {
    title: "Study Jams Info Session 2026–27 · TinyGD",
    description: "Discover Google Cloud pathways, lab quests, and swags. Reserve your pass now.",
    images: [
      {
        url: "https://res.cloudinary.com/startup-grind/image/upload/c_scale,w_2560/c_crop,h_640,w_2560,y_0.0_mul_h_sub_0.0_mul_640/c_crop,h_640,w_2560/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/event_banners/blob_vmPQdAw",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${mono.variable} font-sans antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#FDFDFE] text-[#141b2b] tracking-[-0.015em]">
        {children}
      </body>
    </html>
  );
}
