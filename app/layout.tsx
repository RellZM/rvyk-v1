import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rvyk.dev"),
  title: { default: "RVYK", template: "%s · RVYK" },
  description:
    "Afrel Zharif Muflih, known as RVYK, is a web developer and cybersecurity enthusiast who builds thoughtful digital experiences and explores the security of technology.",
  keywords: [
    "Afrel Zharif Muflih",
    "Afrel Zharif",
    "RVYK",
    "rvyk",
    "web developer",
    "cybersecurity enthusiast",
  ],
  authors: [{ name: "Afrel Zharif Muflih" }],
  openGraph: {
    title: "RVYK",
    description:
      "Web developer and cybersecurity enthusiast building thoughtful digital experiences.",
    type: "website",
    url: "/",
    siteName: "RVYK",
  },
  twitter: { card: "summary_large_image", title: "RVYK" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Before first paint: apply saved theme, and hide the intro overlay if it already played this session. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement;localStorage.getItem("rv-theme")==="light"&&d.setAttribute("data-theme","light");sessionStorage.getItem("rvyk_intro_played")&&d.setAttribute("data-intro-played","")}catch(e){}`,
          }}
        />
      </head>
      <body className="h-full flex flex-col overflow-hidden">
        <LoadingScreen />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
