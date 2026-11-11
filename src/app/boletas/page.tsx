import { AppPage } from "@/components/app-page";
import { HistoryScreen } from "@/components/history/history-screen";

/** Historial: solo la lista de boletas guardadas en este teléfono. */
export default function HistoryPage() {
  return (
    <AppPage>
      <HistoryScreen />
    </AppPage>
  );
}
