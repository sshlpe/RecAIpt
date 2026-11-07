import type { Metadata, Viewport } from "next";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/config/app-info";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Sin "cover", Safari en iOS no pega al borde los elementos fixed abajo (deja un hueco).
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1a33" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: extensiones del navegador inyectan atributos en <html>
    // (ej: __gcrremoteframetoken). Solo afecta los atributos de esta etiqueta, no sus hijos.
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
