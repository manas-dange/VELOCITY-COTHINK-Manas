import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoThink - Intent Clarifier",
  description: "Clarify your intent through collaborative expert dialogue with a live Clarity Score",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}

