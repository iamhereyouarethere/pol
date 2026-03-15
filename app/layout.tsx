import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forza Cricket — Content Command Centre",
  description: "AI-powered cricket content machine for Forza Cricket",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
