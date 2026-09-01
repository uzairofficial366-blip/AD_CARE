import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AD CARE Pharmacy — Your Trusted Online Pharmacy",
  description: "Order prescription and over-the-counter medications online. Fast delivery, licensed pharmacists, and verified prescriptions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
