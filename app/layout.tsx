import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Work Task Toggler",
  description: "Track time spent on work tasks by toggling them on/off",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
