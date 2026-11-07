import { ReceiptAnalyzer } from "@/components/receipt-analyzer";
import { APP_NAME } from "@/lib/config/app-info";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      {/* Marca discreta; el título principal (h1) lo pone cada pantalla. */}
      <p className="mb-5 text-lg font-bold text-muted">{APP_NAME}</p>
      <ReceiptAnalyzer />
    </main>
  );
}
