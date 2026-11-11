"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Mail,
  MessageSquare,
  Send,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { bff } from "@/services/api-client";
import type { AdminReport, Paginated } from "@/lib/api/types";
import { fmtDate } from "@/components/admin/ui";

interface ChatBubble {
  id: string;
  sender: "user" | "admin";
  text: string;
  timestamp: string;
  reportId?: string;
}

function getLocalReplies(reportId: string): Array<{ text: string; timestamp: string }> {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`np_admin_reply_${reportId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReply(reportId: string, text: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalReplies(reportId);
    existing.push({ text, timestamp: new Date().toISOString() });
    localStorage.setItem(`np_admin_reply_${reportId}`, JSON.stringify(existing));
  } catch {}
}

function parseReportBubbles(r: AdminReport): ChatBubble[] {
  const raw = r.details || "";
  const parts = raw.split("\n\n[Admin Reply]:");
  const bubbles: ChatBubble[] = [];

  const userMsg = parts[0]?.trim();
  if (userMsg) {
    bubbles.push({
      id: `user-${r.id}`,
      sender: "user",
      text: userMsg,
      timestamp: fmtDate(r.created_at),
      reportId: r.id,
    });
  }

  for (let i = 1; i < parts.length; i++) {
    const reply = parts[i]?.trim();
    if (reply) {
      bubbles.push({
        id: `admin-${r.id}-${i}`,
        sender: "admin",
        text: reply,
        timestamp: fmtDate(r.created_at),
        reportId: r.id,
      });
    }
  }

  // Also include any locally saved replies for this specific ticket
  const localReplies = getLocalReplies(r.id);
  localReplies.forEach((lr, idx) => {
    if (!bubbles.some((b) => b.sender === "admin" && b.text.trim() === lr.text.trim())) {
      bubbles.push({
        id: `admin-local-${r.id}-${idx}`,
        sender: "admin",
        text: lr.text,
        timestamp: fmtDate(lr.timestamp),
        reportId: r.id,
      });
    }
  });

  return bubbles;
}

export function ReportReplyDialog({ report }: { report: AdminReport }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Message thread state
  const [chatThread, setChatThread] = useState<ChatBubble[]>(() => parseReportBubbles(report));
  const [ticketStatus, setTicketStatus] = useState<string>(() => report.status || "open");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Extract student name strictly from THIS report's details
  const reportFirstLine = (report.details || "").split("\n")[0] || "";
  const extractedName =
    reportFirstLine.includes(":") && reportFirstLine.indexOf(":") < 40
      ? reportFirstLine.split(":")[0]?.trim()
      : report.email
      ? report.email.split("@")[0]
      : "Student";

  // Load conversation thread when modal opens - strictly isolated to this student!
  useEffect(() => {
    if (!isOpen || !report.email) return;

    let cancelled = false;
    const targetEmail = report.email.toLowerCase().trim();

    bff<Paginated<AdminReport>>(
      `admin/reports?size=50`
    )
      .then((res) => {
        if (!cancelled && res?.items) {
          // STRICT CLIENT-SIDE FILTER: ONLY keep reports that strictly match this student's email!
          const userReports = res.items.filter(
            (item) => item.email && item.email.toLowerCase().trim() === targetEmail
          );

          if (userReports.length > 0) {
            const sorted = [...userReports].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            const allBubbles: ChatBubble[] = [];
            sorted.forEach((item) => {
              allBubbles.push(...parseReportBubbles(item));
            });
            setChatThread(allBubbles);
            return;
          }
        }
        if (!cancelled) {
          setChatThread(parseReportBubbles(report));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setChatThread(parseReportBubbles(report));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, report.id, report.email, report]);

  // Scroll to bottom when new bubbles arrive
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatThread, isOpen]);

  const handleCopyEmail = () => {
    if (report.email && typeof navigator !== "undefined") {
      navigator.clipboard.writeText(report.email);
      toast.success("Email copied to clipboard!");
    }
  };

  const handleSendReply = async (resolveTicket: boolean) => {
    const text = replyText.trim();
    if (!text && !resolveTicket) {
      toast.error("Please type a reply message.");
      return;
    }

    setIsSubmitting(true);
    const nextStatus = resolveTicket ? "resolved" : ticketStatus || "open";

    try {
      // 1. Immediately cache reply locally so it displays and persists instantly
      if (text) {
        saveLocalReply(report.id, text);
      }

      // 2. Dispatch PATCH to backend API
      await bff(`admin/reports/${report.id}`, {
        method: "PATCH",
        body: {
          status: nextStatus,
          reply: text || undefined,
        },
      });

      // 3. Immediately update chat thread in UI
      if (text) {
        setChatThread((prev) => [
          ...prev,
          {
            id: `admin-local-${Date.now()}`,
            sender: "admin",
            text,
            timestamp: fmtDate(new Date().toISOString()),
            reportId: report.id,
          },
        ]);
      }

      setTicketStatus(nextStatus);
      setReplyText("");

      if (resolveTicket) {
        toast.success("Query resolved and reply sent to student!");
      } else {
        toast.success("Reply saved to student chat thread!");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-8 items-center gap-1 border-2 border-border bg-card px-2.5 text-xs font-bold uppercase tracking-wider shadow-hard-xs transition-all hover:bg-primary hover:text-primary-foreground active:translate-x-px active:translate-y-px cursor-pointer shrink-0"
        title="Open full support chat and reply"
      >
        <MessageSquare className="size-3.5" aria-hidden="true" />
        <span>Reply</span>
      </button>

      {isOpen && (
        <div
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-dialog-title"
            className="flex flex-col w-full max-w-2xl h-[620px] max-h-[90vh] border-2 border-border bg-card shadow-hard-lg overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header: User Info, Status & Close */}
            <div className="flex items-center justify-between border-b-2 border-border bg-muted/40 px-4 py-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full border-2 border-border bg-primary grid place-items-center text-primary-foreground font-black text-sm shadow-hard-xs shrink-0">
                  <User className="size-4 text-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      id="chat-dialog-title"
                      className="text-sm font-black uppercase tracking-wider text-foreground leading-tight"
                    >
                      {extractedName}
                    </h3>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider border-2 border-border shadow-hard-xs ${
                        ticketStatus === "resolved"
                          ? "bg-emerald-500 text-white"
                          : ticketStatus === "dismissed"
                          ? "bg-muted text-muted-foreground"
                          : "bg-amber-400 text-black"
                      }`}
                    >
                      {ticketStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-0.5">
                    <span>{report.email || "No email"}</span>
                    {report.email && (
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="hover:text-foreground inline-flex items-center gap-0.5"
                        title="Copy email"
                      >
                        <Copy className="size-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Right: Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid size-8 place-items-center border-2 border-border bg-card text-foreground transition-all hover:bg-muted active:translate-x-px active:translate-y-px cursor-pointer"
                  title="Close chat"
                  aria-label="Close chat"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Chat Body: Thread History Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/15">
              {chatThread.map((bubble) => {
                const isUser = bubble.sender === "user";
                // Clean display text by removing redundant "StudentName:" prefix if present
                let displayText = bubble.text;
                if (isUser && displayText.startsWith(`${extractedName}:`)) {
                  displayText = displayText.slice(extractedName.length + 1).trim();
                }

                return (
                  <div
                    key={bubble.id}
                    className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}
                  >
                    {/* Sender Label & Timestamp */}
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 px-1">
                      <span>{isUser ? `Student (${extractedName})` : "Admin (You)"}</span>
                      <span>•</span>
                      <span>{bubble.timestamp}</span>
                    </div>

                    {/* Speech Bubble */}
                    <div
                      className={`max-w-[85%] rounded-sm p-3 text-xs sm:text-sm font-medium border-2 border-border shadow-hard-xs ${
                        isUser
                          ? "bg-card text-foreground"
                          : "bg-primary text-primary-foreground font-semibold"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{displayText}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Reply Input Area */}
            <div className="border-t-2 border-border bg-card p-3 sm:p-4 space-y-2.5 shrink-0">
              <div className="relative">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the student... (Dispatched to their support chat thread)"
                  className="w-full border-2 border-border bg-background p-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-hard-xs resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (replyText.trim()) handleSendReply(false);
                    }
                  }}
                />
              </div>

              {/* Bottom Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {/* External Email Link */}
                {report.email ? (
                  <a
                    href={`mailto:${report.email}?subject=${encodeURIComponent(
                      "Re: Notes & Papers Support Query"
                    )}&body=${encodeURIComponent(
                      `Hi ${extractedName},\n\nRegarding your query:\n"${report.details}"\n\n`
                    )}`}
                    className="inline-flex h-8 items-center gap-1.5 border-2 border-border bg-muted/40 px-2.5 text-xs font-bold uppercase tracking-wider shadow-hard-xs hover:bg-muted active:translate-x-px active:translate-y-px transition-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Mail className="size-3.5 text-primary" />
                    <span>Email App</span>
                  </a>
                ) : (
                  <div />
                )}

                {/* Send and Resolve Controls */}
                <div className="flex items-center gap-2 ml-auto">
                  {/* Send Reply (keep open) */}
                  <button
                    type="button"
                    disabled={isSubmitting || !replyText.trim()}
                    onClick={() => handleSendReply(false)}
                    className="inline-flex h-8 items-center gap-1.5 border-2 border-border bg-card px-3 text-xs font-bold uppercase tracking-wider shadow-hard-xs hover:bg-muted active:translate-x-px active:translate-y-px transition-all disabled:opacity-40 cursor-pointer"
                    title="Send message and keep ticket open"
                  >
                    <Send className="size-3" />
                    <span>Send Reply</span>
                  </button>

                  {/* Reply & Resolve */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSendReply(true)}
                    className="inline-flex h-8 items-center gap-1.5 border-2 border-border bg-primary px-3.5 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-hard hover:shadow-hard-lg active:translate-x-px active:translate-y-px transition-all disabled:opacity-40 cursor-pointer"
                    title="Send reply (if any) and mark query resolved"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>{replyText.trim() ? "Reply & Resolve ✓" : "Resolve Query ✓"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
