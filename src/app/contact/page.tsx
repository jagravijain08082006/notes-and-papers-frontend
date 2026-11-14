import Link from "next/link";
import { Mail, Send } from "lucide-react";
import { ProsePage } from "@/components/shared/prose-page";
import { SupportChatTrigger } from "@/components/shared/support-chat";
import { CONTACT_EMAIL, INSTAGRAM_URL, TELEGRAM_URL } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact & Support | Notes & Papers",
  description:
    "Get instant student support, request missing question papers, report broken links, or reach out to our team.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <ProsePage
      title="Contact & Support"
      path="/contact"
      intro="Missing a paper? Found a mistake? Chat directly with our team for the fastest response."
    >
      {/* Primary Hero: Live Support Chat Card */}
      <div className="border-2 border-border bg-card p-5 sm:p-7 shadow-hard-lg space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-border pb-5">
          <div className="space-y-1">
            <span className="eyebrow inline-flex items-center gap-1.5 border border-border bg-primary px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-xs">
              <span className="size-2 rounded-full bg-foreground inline-block" />
              Live Assistance
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-wide text-foreground mt-2">
              Instant Support Chat
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
              Log in to talk directly with our support team. Request missing exam papers, report broken links, or ask any question—replies appear right inside your chat.
            </p>
          </div>

          <SupportChatTrigger
            label="Open Support Chat 💬"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-border bg-primary px-5 py-3 text-sm font-black uppercase tracking-wider text-primary-foreground shadow-hard hover:shadow-hard-lg active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
          />
        </div>

        {/* Quick Topic Launchers */}
        <div className="space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Or launch a quick request:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <SupportChatTrigger
              question="I'd like to request a missing paper: "
              label="Request a Paper"
              className="inline-flex items-center justify-start gap-2 border-2 border-border bg-muted/30 hover:bg-primary/20 p-3 text-xs font-bold uppercase tracking-wide text-foreground shadow-hard-xs hover:shadow-hard transition-all cursor-pointer text-left"
            />
            <SupportChatTrigger
              question="I found a broken link or issue with a paper."
              label="Report Broken PDF"
              className="inline-flex items-center justify-start gap-2 border-2 border-border bg-muted/30 hover:bg-primary/20 p-3 text-xs font-bold uppercase tracking-wide text-foreground shadow-hard-xs hover:shadow-hard transition-all cursor-pointer text-left"
            />
            <SupportChatTrigger
              question="I want to suggest adding a new university, board, or exam."
              label="Suggest University / Exam"
              className="inline-flex items-center justify-start gap-2 border-2 border-border bg-muted/30 hover:bg-primary/20 p-3 text-xs font-bold uppercase tracking-wide text-foreground shadow-hard-xs hover:shadow-hard transition-all cursor-pointer text-left"
            />
          </div>
        </div>
      </div>

      {/* Alternative Direct Channels */}
      <div className="space-y-3 pt-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          Other Ways to Reach Us
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CONTACT_EMAIL && (
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="border-2 border-border bg-card p-3.5 shadow-hard-sm hover:shadow-hard transition-all block group"
            >
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                <Mail className="size-4 text-primary" />
                <span>Email Us</span>
              </div>
              <p className="mt-1 text-xs font-medium text-foreground truncate">
                {CONTACT_EMAIL}
              </p>
            </a>
          )}

          {TELEGRAM_URL && (
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-border bg-card p-3.5 shadow-hard-sm hover:shadow-hard transition-all block group"
            >
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                <Send className="size-4 text-primary" />
                <span>Telegram Channel</span>
              </div>
              <p className="mt-1 text-xs font-medium text-foreground">
                @notes_and_papers
              </p>
            </a>
          )}

          {INSTAGRAM_URL && (
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-border bg-card p-3.5 shadow-hard-sm hover:shadow-hard transition-all block group"
            >
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                <span className="size-4 text-primary font-black text-xs leading-none">📸</span>
                <span>Instagram</span>
              </div>
              <p className="mt-1 text-xs font-medium text-foreground">
                @exam.notes.and.papers
              </p>
            </a>
          )}
        </div>
      </div>

      {/* Notice info */}
      <div className="border-t-2 border-border pt-4 text-xs text-muted-foreground space-y-1">
        <p>
          To report a problem with a specific paper, use <em>Report a problem</em> on that paper&apos;s page.
        </p>
        <p>
          For copyright or DMCA concerns, visit our{" "}
          <Link href="/takedown" className="font-bold underline text-foreground hover:text-primary">
            Takedown Request
          </Link>{" "}
          form.
        </p>
      </div>
    </ProsePage>
  );
}
