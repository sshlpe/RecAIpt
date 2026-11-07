import { ReceiptAnalyzer } from "@/components/receipt-analyzer";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <h1 className="mb-5 text-2xl font-extrabold">Revisar boleta</h1>
      <ReceiptAnalyzer />
    </main>
  );
}
