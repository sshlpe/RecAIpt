import { AppPage } from "@/components/app-page";
import { SavedReceiptScreen } from "@/components/history/saved-receipt-screen";

/** Boleta del historial. Vive en el dispositivo (IndexedDB), así que se carga en el cliente. */
export default async function SavedReceiptPage({ params }: PageProps<"/boletas/[id]">) {
  const { id } = await params;
  return (
    <AppPage>
      <SavedReceiptScreen id={id} />
    </AppPage>
  );
}
