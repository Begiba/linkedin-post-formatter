import { Analytics } from "@vercel/analytics/next";
import AnalyticsEvents from "./components/AnalyticsEvents";
import './globals.css';

export const metadata = {
  title: "LinkedIn Post Formatter – Write & Format LinkedIn Posts Easily",
  description: "An online tool to format LinkedIn posts with bold, italic, monospace, emojis, and hashtags. Copy-paste-ready, fully free and live.",
  openGraph: {
    title: "LinkedIn Post Formatter",
    description: "Format LinkedIn posts easily with emojis, bold, italic, monospace & hashtags. Copy-paste ready.",
    url: "https://linkedin-post-formatter-8tcn.vercel.app",
    siteName: "LinkedIn Post Formatter",
    images: [
      {
        url: "https://linkedin-post-formatter-8tcn.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "LinkedIn Post Formatter"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkedIn Post Formatter",
    description: "Format LinkedIn posts easily with emojis, bold, italic, monospace & hashtags. Copy-paste ready.",
    images: ["https://linkedin-post-formatter-8tcn.vercel.app/og-image.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Vercel Analytics tracks page views & custom events */}
        <AnalyticsEvents /> {/* Global events tracker */}
        <Analytics /> {/* Vercel Analytics component */}  
      </body>
    </html>
  );
}
