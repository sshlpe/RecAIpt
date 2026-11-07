import type { ReactNode } from "react";
import { TONE_SURFACE_CLASS, TONE_TEXT_CLASS, type Tone } from "./tone-styles";

interface NoticeBoxProps {
  tone: Tone;
  title: string;
  children?: ReactNode;
}

export function NoticeBox({ tone, title, children }: NoticeBoxProps) {
  return (
    <section role="status" className={`rounded-2xl border-4 p-5 ${TONE_SURFACE_CLASS[tone]}`}>
      <h2 className={`text-xl font-extrabold ${TONE_TEXT_CLASS[tone]}`}>{title}</h2>
      {children && <div className="mt-2 space-y-2 text-base">{children}</div>}
    </section>
  );
}
