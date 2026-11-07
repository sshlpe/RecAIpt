import type { VerificationMessage } from "@/lib/receipt/describe-verification";
import { NoticeBox } from "./ui/notice-box";

export function VerificationSummary({ message }: { message: VerificationMessage }) {
  return (
    <NoticeBox tone={message.tone} title={message.title}>
      {message.details.map((detail) => (
        <p key={detail}>{detail}</p>
      ))}
    </NoticeBox>
  );
}
