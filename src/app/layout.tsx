import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "CatchUpDiaries",
  description: "A dreamy private diary app for sharing the texture of your days.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
