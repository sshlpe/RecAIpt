import { MAX_PARTIES, MIN_PARTIES, type SplitParty } from "@/lib/split/bill-split";
import { Stepper } from "../ui/stepper";
import { TextField } from "../ui/text-field";

interface PartySetupProps {
  parties: SplitParty[];
  onCountChange: (count: number) => void;
  onRename: (partyId: string, name: string) => void;
}

/** Cuántos grupos dividen la cuenta y cómo se llama cada uno. */
export function PartySetup({ parties, onCountChange, onRename }: PartySetupProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-extrabold">¿Entre cuántos grupos?</h2>
        <Stepper
          label="Cantidad de grupos"
          value={parties.length}
          min={MIN_PARTIES}
          max={MAX_PARTIES}
          onChange={onCountChange}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {parties.map((party, index) => (
          <TextField
            key={party.id}
            label={`Nombre del grupo ${index + 1}`}
            value={party.name}
            onChange={(event) => onRename(party.id, event.target.value)}
          />
        ))}
      </div>
    </section>
  );
}
