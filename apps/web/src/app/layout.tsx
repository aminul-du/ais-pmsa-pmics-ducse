import type { Metadata } from "next";
import "./globals.css";
import NavShell from "../components/NavShell";

export const metadata: Metadata = {
  title: "ShorbornoAI & AIS-PMSA Research Dashboard",
  description: "Multi-page research UI for ShorbornoAI and AIS-PMSA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <NavShell>{children}</NavShell>
      </body>
    </html>
  );
}
