import { ReceiptAnalyzer } from "@/components/receipt-analyzer";
import { AppLogo } from "@/components/ui/app-logo";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      {/* Marca; el título principal (h1) lo pone cada pantalla. */}
      <header className="mb-5">
        <AppLogo />
      </header>
      <ReceiptAnalyzer />
    </main>
  );
}
