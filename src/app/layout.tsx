import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next } from "next/font/google";
import { ActiveReceiptProvider } from "@/components/active-receipt-provider";
import { APP_DESCRIPTION, APP_NAME, BRAND_BAR } from "@/lib/config/app-info";
import "./globals.css";

/** Familia diseñada para baja visión; la Mono imita la impresión de una boleta. */
const atkinson = Atkinson_Hyperlegible_Next({ subsets: ["latin"], variable: "--font-atkinson" });
const atkinsonMono = Atkinson_Hyperlegible_Mono({
  subsets: ["latin"],
  variable: "--font-atkinson-mono",
});

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
  // La barra del navegador sigue a la barra superior de la app.
  themeColor: BRAND_BAR,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: extensiones del navegador inyectan atributos en <html>
    // (ej: __gcrremoteframetoken). Solo afecta los atributos de esta etiqueta, no sus hijos.
    <html
      lang="es"
      className={`${atkinson.variable} ${atkinsonMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ActiveReceiptProvider>{children}</ActiveReceiptProvider>
      </body>
    </html>
  );
}
