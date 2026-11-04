import { Mail, Phone, Send } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_PHONE, INSTAGRAM_URL, TELEGRAM_URL } from "@/lib/env";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/** Clickable contact & community links */
export function ContactDetails({ className }: { className?: string }) {
  const tel = CONTACT_PHONE ? CONTACT_PHONE.replace(/[^+\d]/g, "") : "";
  return (
    <ul className={className ?? "space-y-2 text-sm font-medium"}>
      {CONTACT_EMAIL && (
        <li>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 hover:underline hover:decoration-2 hover:underline-offset-4"
          >
            <Mail className="size-4" aria-hidden="true" /> {CONTACT_EMAIL}
          </a>
        </li>
      )}
      {CONTACT_PHONE && (
        <li>
          <a
            href={`tel:${tel}`}
            className="inline-flex items-center gap-2 hover:underline hover:decoration-2 hover:underline-offset-4"
          >
            <Phone className="size-4" aria-hidden="true" /> {CONTACT_PHONE}
          </a>
        </li>
      )}
      <li>
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 hover:underline hover:decoration-2 hover:underline-offset-4"
        >
          <Send className="size-4 text-[#229ED9]" aria-hidden="true" /> @notes_and_papers
        </a>
      </li>
      <li>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 hover:underline hover:decoration-2 hover:underline-offset-4"
        >
          <InstagramIcon className="size-4 text-[#E1306C]" /> @exam.notes.and.papers
        </a>
      </li>
    </ul>
  );
}
