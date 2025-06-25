import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./providers";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Inventario Físico",
  description: "Sistema de Inventario Físico",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Script src="/sounds.js" strategy="beforeInteractive" />
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
