"use client";

import { useEffect, useRef, useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Mail,
  MessageSquare,
  RotateCw,
  Search,
  Send,
  User,
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
  reportId: string;
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

function getSeenReports(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("np_admin_seen_reports");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markReportSeen(reportId: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getSeenReports();
    if (!existing.includes(reportId)) {
      existing.push(reportId);
      localStorage.setItem("np_admin_seen_reports", JSON.stringify(existing));
    }
  } catch {}
}

function extractStudentName(report: AdminReport): string {
  const details = report.details || "";
  const firstLine = details.split("\n")[0] || "";
  if (firstLine.includes(":") && firstLine.indexOf(":") < 40) {
    return firstLine.split(":")[0]?.trim() || "Student";
  }
  if (report.email) {
    return report.email.split("@")[0] || "Student";
  }
  return "Student";
}

function parseBubblesForReport(r: AdminReport): ChatBubble[] {
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

  // Include locally cached replies
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

export function SupportChatConsole({ initialReports }: { initialReports: AdminReport[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // State
  const [reports, setReports] = useState<AdminReport[]>(initialReports);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(() => {
    return initialReports[0]?.id || null;
  });
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "resolved">("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>(() => getSeenReports());
  const [showMobileChat, setShowMobileChat] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Current selected report
  const selectedReport = useMemo(() => {
    return reports.find((r) => r.id === selectedReportId) || null;
  }, [reports, selectedReportId]);

  // When a report is selected, mark it as seen
  const handleSelectReport = (r: AdminReport) => {
    setSelectedReportId(r.id);
    setShowMobileChat(true);
    markReportSeen(r.id);
    setSeenIds((prev) => (prev.includes(r.id) ? prev : [...prev, r.id]));
  };

  // Build the message thread for the selected report
  const activeThread = useMemo(() => {
    if (!selectedReport) return [];

    // If report has email, also include other messages from same email
    if (selectedReport.email) {
      const email = selectedReport.email.toLowerCase().trim();
      const studentReports = reports
        .filter((r) => r.email && r.email.toLowerCase().trim() === email)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      const allBubbles: ChatBubble[] = [];
      studentReports.forEach((sr) => {
        allBubbles.push(...parseBubblesForReport(sr));
      });
      return allBubbles;
    }

    return parseBubblesForReport(selectedReport);
  }, [selectedReport, reports]);

  // Auto-scroll chat container to bottom strictly inside the container (prevents whole window jumping)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeThread, selectedReportId]);

  // Filtered conversation list
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Status filter
      if (filterStatus === "open" && r.status !== "open") return false;
      if (filterStatus === "resolved" && r.status !== "resolved") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = extractStudentName(r).toLowerCase();
        const email = (r.email || "").toLowerCase();
        const details = (r.details || "").toLowerCase();
        return name.includes(q) || email.includes(q) || details.includes(q);
      }
      return true;
    });
  }, [reports, filterStatus, searchQuery]);

  // Unread count
  const unreadCount = useMemo(() => {
    return reports.filter((r) => r.status === "open" && !seenIds.includes(r.id)).length;
  }, [reports, seenIds]);

  // Refresh reports from backend
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await bff<Paginated<AdminReport>>("admin/reports?size=100");
      if (res?.items) {
        setReports(res.items);
        toast.success("Inbox refreshed!");
      }
    } catch {
      toast.error("Failed to refresh inbox.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle reply submission
  const handleSendReply = async (resolveTicket: boolean) => {
    if (!selectedReport) return;
    const text = replyText.trim();
    if (!text && !resolveTicket) {
      toast.error("Please type a message.");
      return;
    }

    setIsSubmitting(true);
    const nextStatus = resolveTicket ? "resolved" : selectedReport.status || "open";

    try {
      if (text) {
        saveLocalReply(selectedReport.id, text);
      }

      await bff(`admin/reports/${selectedReport.id}`, {
        method: "PATCH",
        body: {
          status: nextStatus,
          reply: text || undefined,
        },
      });

      // Update report status and details locally
      setReports((prev) =>
        prev.map((r) => {
          if (r.id === selectedReport.id) {
            const updatedDetails = text
              ? `${r.details || ""}\n\n[Admin Reply]: ${text}`
              : r.details;
            return { ...r, status: nextStatus, details: updatedDetails };
          }
          return r;
        })
      );

      setReplyText("");
      if (resolveTicket) {
        toast.success("Query resolved and reply dispatched!");
      } else {
        toast.success("Reply saved to student thread!");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send response.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick status toggle
  const handleToggleStatus = async (status: "open" | "resolved" | "dismissed") => {
    if (!selectedReport) return;
    setIsSubmitting(true);
    try {
      await bff(`admin/reports/${selectedReport.id}`, {
        method: "PATCH",
        body: { status },
      });
      setReports((prev) =>
        prev.map((r) => (r.id === selectedReport.id ? { ...r, status } : r))
      );
      toast.success(`Ticket marked as ${status}.`);
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyEmail = (email: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(email);
      toast.success("Email copied!");
    }
  };

  const selectedName = selectedReport ? extractStudentName(selectedReport) : "";

  return (
    <div className="flex flex-col w-full border-2 border-border bg-card shadow-hard-lg overflow-hidden">
      {/* Top Banner Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-border bg-muted/40 px-3.5 py-2.5 gap-2">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="size-4 text-foreground" />
          <span className="text-xs font-black uppercase tracking-wider text-foreground">
            Student Conversations
          </span>
          {unreadCount > 0 && (
            <span className="inline-flex items-center gap-1 border-2 border-border bg-destructive px-2 py-0.5 text-[10px] font-black uppercase text-destructive-foreground shadow-hard-xs animate-pulse">
              {unreadCount} Unseen
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex h-8 items-center gap-1.5 border-2 border-border bg-card px-2.5 text-xs font-bold uppercase tracking-wider shadow-hard-xs hover:bg-muted active:translate-x-px active:translate-y-px transition-all cursor-pointer"
            title="Refresh conversations"
          >
            <RotateCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Two-Pane Split Layout */}
      <div className="flex flex-col md:flex-row h-[720px] max-h-[85vh] w-full min-w-0">
        {/* ================= LEFT PANE: CONVERSATION LIST ================= */}
        <div
          className={`w-full md:w-80 lg:w-96 border-b-2 md:border-b-0 md:border-r-2 border-border bg-background flex flex-col shrink-0 min-w-0 h-full ${
            showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search & Filter Header */}
          <div className="p-3 border-b-2 border-border bg-card space-y-2 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, email, query..."
                className="w-full border-2 border-border bg-background py-1.5 pl-8 pr-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-hard-xs"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5">
              {(["open", "resolved", "all"] as const).map((st) => {
                const active = filterStatus === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={`flex-1 py-1 text-[11px] font-black uppercase tracking-wider border-2 border-border transition-all cursor-pointer ${
                      active
                        ? "bg-primary text-primary-foreground shadow-hard-xs"
                        : "bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Conversation Items */}
          <div className="flex-1 overflow-y-auto divide-y-2 divide-border/40">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider">No conversations found</p>
                <p className="text-[11px]">No inquiries match your current filter.</p>
              </div>
            ) : (
              filteredReports.map((r) => {
                const isSelected = selectedReportId === r.id;
                const isUnseen = r.status === "open" && !seenIds.includes(r.id);
                const name = extractStudentName(r);
                const rawDetails = (r.details || "").split("\n\n[Admin Reply]:")[0] || "";
                // Snippet without name prefix
                let snippet = rawDetails;
                if (snippet.startsWith(`${name}:`)) {
                  snippet = snippet.slice(name.length + 1).trim();
                }

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectReport(r)}
                    className={`w-full text-left p-3 transition-colors cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-primary/20 border-l-4 border-l-primary"
                        : "hover:bg-muted/50 bg-card"
                    }`}
                  >
                    {/* Student Avatar */}
                    <div className="size-8 rounded-full border-2 border-border bg-card grid place-items-center text-xs font-black shadow-hard-xs shrink-0 mt-0.5">
                      {name.charAt(0).toUpperCase()}
                    </div>

                    {/* Preview Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-black uppercase truncate ${
                            isUnseen ? "text-foreground font-black" : "text-foreground/90"
                          }`}
                        >
                          {name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          {fmtDate(r.created_at)}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                        {snippet || "Query received"}
                      </p>

                      <div className="flex items-center justify-between gap-1.5 mt-1.5">
                        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[130px]">
                          {r.email || "No email"}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {isUnseen && (
                            <span className="inline-block size-2 rounded-full bg-destructive border border-background shadow-hard-xs" />
                          )}
                          <span
                            className={`inline-flex px-1.5 py-0.2 text-[9px] font-black uppercase border border-border shadow-hard-xs ${
                              r.status === "resolved"
                                ? "bg-emerald-500 text-white"
                                : r.status === "dismissed"
                                ? "bg-muted text-muted-foreground"
                                : "bg-amber-400 text-black"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT PANE: ACTIVE CHAT & REPLY CONSOLE ================= */}
        <div
          className={`flex-1 flex flex-col h-full bg-card min-w-0 ${
            showMobileChat ? "flex" : "hidden md:flex"
          }`}
        >
          {selectedReport ? (
            <>
              {/* Active Chat Header */}
              <div className="border-b-2 border-border bg-muted/30 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1.5 border-2 border-border bg-card hover:bg-muted text-foreground cursor-pointer"
                    title="Back to inbox"
                  >
                    <ArrowLeft className="size-4" />
                  </button>

                  <div className="size-9 rounded-full border-2 border-border bg-primary grid place-items-center text-sm font-black text-primary-foreground shadow-hard-xs shrink-0">
                    <User className="size-4 text-foreground" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground truncate">
                        {selectedName}
                      </h3>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider border-2 border-border shadow-hard-xs ${
                          selectedReport.status === "resolved"
                            ? "bg-emerald-500 text-white"
                            : selectedReport.status === "dismissed"
                            ? "bg-muted text-muted-foreground"
                            : "bg-amber-400 text-black"
                        }`}
                      >
                        {selectedReport.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-0.5">
                      <span className="truncate max-w-[200px] sm:max-w-none">
                        {selectedReport.email || "No email provided"}
                      </span>
                      {selectedReport.email && (
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(selectedReport.email!)}
                          className="hover:text-foreground inline-flex items-center gap-0.5 cursor-pointer"
                          title="Copy email"
                        >
                          <Copy className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 ml-auto">
                  {selectedReport.paper_slug && (
                    <Link
                      href={`/papers/${selectedReport.paper_slug}`}
                      target="_blank"
                      className="inline-flex h-8 items-center gap-1 border-2 border-border bg-card px-2.5 text-xs font-bold uppercase tracking-wider shadow-hard-xs hover:bg-muted transition-all"
                      title="View linked paper"
                    >
                      <ExternalLink className="size-3" />
                      <span className="hidden sm:inline">Paper</span>
                    </Link>
                  )}

                  {selectedReport.email && (
                    <a
                      href={`mailto:${selectedReport.email}?subject=${encodeURIComponent(
                        "Re: Notes & Papers Support"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center gap-1 border-2 border-border bg-card px-2.5 text-xs font-bold uppercase tracking-wider shadow-hard-xs hover:bg-muted transition-all"
                      title="Open external email app"
                    >
                      <Mail className="size-3" />
                      <span className="hidden sm:inline">Email</span>
                    </a>
                  )}

                  {selectedReport.status === "open" ? (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleToggleStatus("resolved")}
                      className="inline-flex h-8 items-center gap-1 border-2 border-border bg-card px-2.5 text-xs font-bold uppercase tracking-wider shadow-hard-xs hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                      title="Mark resolved"
                    >
                      <Check className="size-3" />
                      <span>Resolve</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleToggleStatus("open")}
                      className="inline-flex h-8 items-center gap-1 border-2 border-border bg-card px-2.5 text-xs font-bold uppercase tracking-wider shadow-hard-xs hover:bg-muted transition-all cursor-pointer"
                      title="Reopen query"
                    >
                      <RotateCw className="size-3" />
                      <span>Reopen</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-muted/10">
                {activeThread.map((bubble) => {
                  const isUser = bubble.sender === "user";
                  let text = bubble.text;
                  if (isUser && text.startsWith(`${selectedName}:`)) {
                    text = text.slice(selectedName.length + 1).trim();
                  }

                  return (
                    <div
                      key={bubble.id}
                      className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}
                    >
                      {/* Sender Label & Timestamp */}
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 px-1">
                        <span>{isUser ? `Student (${selectedName})` : "Admin (You)"}</span>
                        <span>•</span>
                        <span>{bubble.timestamp}</span>
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[85%] rounded-sm p-3 text-xs sm:text-sm font-medium border-2 border-border shadow-hard-xs ${
                          isUser
                            ? "bg-card text-foreground"
                            : "bg-primary text-primary-foreground font-semibold"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input Bar */}
              <div className="border-t-2 border-border bg-card p-3 sm:p-4 space-y-2.5 shrink-0">
                <div className="relative">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Type response to ${selectedName}... (Enter to send, Shift+Enter for new line)`}
                    className="w-full border-2 border-border bg-background p-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-hard-xs resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (replyText.trim()) handleSendReply(false);
                      }
                    }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Replies dispatch to student support chat & email ticket
                  </span>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      disabled={isSubmitting || !replyText.trim()}
                      onClick={() => handleSendReply(false)}
                      className="inline-flex h-8 items-center gap-1.5 border-2 border-border bg-card px-3 text-xs font-bold uppercase tracking-wider shadow-hard-xs hover:bg-muted active:translate-x-px active:translate-y-px transition-all disabled:opacity-40 cursor-pointer"
                      title="Send response and keep open"
                    >
                      <Send className="size-3" />
                      <span>Send Reply</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSendReply(true)}
                      className="inline-flex h-8 items-center gap-1.5 border-2 border-border bg-primary px-3.5 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-hard hover:shadow-hard-lg active:translate-x-px active:translate-y-px transition-all disabled:opacity-40 cursor-pointer"
                      title="Send response and mark resolved"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>{replyText.trim() ? "Reply & Resolve ✓" : "Resolve Query ✓"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-3">
              <div className="size-14 rounded-full border-2 border-border bg-muted/40 grid place-items-center shadow-hard-xs">
                <MessageSquare className="size-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                No Conversation Selected
              </h3>
              <p className="text-xs max-w-sm">
                Select a student inquiry from the left inbox to view their conversation history and reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
