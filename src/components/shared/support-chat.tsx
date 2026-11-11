"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  RotateCw,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { NoteyAvatar } from "@/components/account/notey-avatar";
import { useMe } from "@/hooks/use-me";
import { bff } from "@/services/api-client";
import type { ReportOut, UserSupportMessage } from "@/lib/api/types";

interface ChatMessage {
  id: string;
  sender: "notey" | "user";
  text: string;
  timestamp: number;
  ticketId?: string;
  ticketStatus?: "open" | "resolved" | "dismissed";
}

interface QuickChip {
  id: string;
  label: string;
  icon: string;
  promptText: string;
  isGuide?: boolean;
}

interface TourStep {
  animation: string;
  badge: string;
  title: string;
  speech: string;
  tip: string;
  action?: {
    href: string;
    label: string;
  };
}

const STORAGE_CHAT_KEY = "np_support_chat_messages_v1";
const STORAGE_EMAIL_KEY = "np_support_chat_guest_email_v1";

const QUICK_CHIPS: QuickChip[] = [
  {
    id: "guide",
    label: "Tour",
    icon: "✨",
    promptText: "Can you give me a tour of Notes & Papers?",
    isGuide: true,
  },
  {
    id: "missing_paper",
    label: "Request Paper",
    icon: "📄",
    promptText: "I'd like to request a paper: ",
  },
  {
    id: "broken_pdf",
    label: "Report Issue",
    icon: "⚠️",
    promptText: "I found a broken link or issue with a paper.",
  },
  {
    id: "clean_pdf",
    label: "Clean PDFs",
    icon: "📥",
    promptText: "How do I download clean, ad-free PDFs?",
  },
  {
    id: "suggest_board",
    label: "Suggest Exam",
    icon: "🏫",
    promptText: "I want to suggest adding a new university, board, or exam.",
  },
];

function sanitizeMessages(msgs: ChatMessage[]): ChatMessage[] {
  const seen = new Set<string>();
  const result: ChatMessage[] = [];
  let tourCompletedSeen = false;

  for (const msg of msgs) {
    const textTrim = (msg.text || "").trim();
    if (textTrim.includes("Tour completed!")) {
      if (tourCompletedSeen) continue;
      tourCompletedSeen = true;
    }
    if (seen.has(msg.id)) continue;
    seen.add(msg.id);

    const prev = result[result.length - 1];
    if (prev && prev.sender === msg.sender && prev.text.trim() === textTrim) {
      continue;
    }
    result.push(msg);
  }
  return result;
}

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function SupportChat() {
  const pathname = usePathname();
  const { data: user } = useMe();
  const isMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "guide">("chat");
  const [floatingAnim, setFloatingAnim] = useState("idle");
  const [modalAnim, setModalAnim] = useState("happy");
  const [currentStep, setCurrentStep] = useState(0);

  // Chat notification state - only true if a genuine unseen admin reply arrives
  const [hasUnreadNotification, setHasUnreadNotification] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("np_has_unread_notif") === "true";
    }
    return false;
  });

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_CHAT_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return sanitizeMessages(parsed);
          }
        }
      } catch {
        // ignore
      }
    }
    return [
      {
        id: "welcome-1",
        sender: "notey",
        text: "Hey Scholar! 👋 How can we help you? Pick an option below or type your message.",
        timestamp: Date.now(),
      },
    ];
  });
  const [inputText, setInputText] = useState("");
  const [guestEmail, setGuestEmail] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(STORAGE_EMAIL_KEY) || "";
      } catch {
        // ignore
      }
    }
    return "";
  });
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const userName = user?.display_name?.split(" ")[0] || "Scholar";

  const tourSteps: TourStep[] = [
    {
      animation: "happy",
      badge: "Welcome",
      title: `Welcome, ${userName}! 👋`,
      speech:
        "I'm Notey, your academic guide! Notes & Papers gives you 7,800+ previous year papers for UNIRAJ, RTU Kota, and exams—100% free with clean PDFs.",
      tip: "Everything is free with your student account.",
      action: {
        href: "/universities",
        label: "Browse Universities",
      },
    },
    {
      animation: "searching",
      badge: "Search",
      title: "Instant Paper Search 🔍",
      speech:
        "Quickly find papers by course (BCA, BSc, BTech, BCom), semester number, or exact subject code.",
      tip: "Use the top search bar anytime to jump to your subject.",
      action: {
        href: "/search",
        label: "Try Search",
      },
    },
    {
      animation: "proud",
      badge: "Downloads",
      title: "Clean Watermark-Free PDFs 📄",
      speech:
        "Preview every paper in your browser before downloading. High-resolution with zero ads or watermarks.",
      tip: "Papers stay organized in your Downloads tab.",
      action: {
        href: "/downloads",
        label: "My Downloads",
      },
    },
    {
      animation: "excited",
      badge: "Bookmarks",
      title: "Save For Exam Night 🔖",
      speech:
        "Tap the bookmark icon on any paper to save it to your personal vault for fast revision before exams.",
      tip: "Keep all your midterm and final papers in one place.",
      action: {
        href: "/bookmarks",
        label: "My Bookmarks",
      },
    },
    {
      animation: "celebrate",
      badge: "Uploads",
      title: "Share & Help Others 🚀",
      speech:
        "Have recent semester papers or clean notes? Upload them to help fellow university students succeed!",
      tip: "Tap me anytime at the bottom right for a refresher.",
      action: {
        href: "/upload",
        label: "Upload Paper",
      },
    },
  ];

  // Inactivity on floating mascot
  const resetInactivity = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setFloatingAnim("drowsy");
      setTimeout(() => {
        setFloatingAnim("sleeping");
      }, 4000);
    }, 30000);
  }, []);


  // Save chat history
  useEffect(() => {
    if (typeof window === "undefined" || messages.length === 0) return;
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && mode === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, mode]);

  // Listen to open events & hotkeys
  useEffect(() => {
    const handleOpenSupport = (e: Event) => {
      const custom = e as CustomEvent<{ question?: string }>;
      setIsOpen(true);
      setMode("chat");
      setFloatingAnim("happy");
      if (custom.detail?.question) {
        setInputText(custom.detail.question);
      }
    };

    const handleOpenGuide = () => {
      setIsOpen(true);
      setMode("guide");
      setCurrentStep(0);
      setModalAnim("happy");
    };

    const handleActivity = () => resetInactivity();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("np:open-support-chat", handleOpenSupport);
    window.addEventListener("np:open-guide-tour", handleOpenGuide);
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      window.removeEventListener("np:open-support-chat", handleOpenSupport);
      window.removeEventListener("np:open-guide-tour", handleOpenGuide);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, resetInactivity]);

  // Check ticket status on-demand (Manual Refresh - No Polling)
  const refreshTicketStatus = useCallback(async () => {
    const emailToQuery = user?.email || guestEmail;
    if (!emailToQuery || !emailToQuery.includes("@")) {
      toast.info("Enter your email below so we can look up your support tickets.");
      return;
    }

    setIsRefreshing(true);
    try {
      const reports = await bff<UserSupportMessage[]>(
        `contact/my?email=${encodeURIComponent(emailToQuery)}`
      ).catch(() => null);

      let updatedCount = 0;
      setMessages((prev) => {
        const next = [...prev];

        if (reports && Array.isArray(reports) && reports.length > 0) {
          next.forEach((msg, idx) => {
            if (!msg.ticketId) return;
            const match = reports.find((r) => r.id === msg.ticketId);
            if (match && match.status !== msg.ticketStatus) {
              updatedCount++;
              next[idx] = {
                ...msg,
                ticketStatus: match.status as "open" | "resolved" | "dismissed",
              };
            }
          });

          // If any report has an admin reply, insert it into chat
          reports.forEach((rep) => {
            if (rep.details && rep.details.includes("[Admin Reply]:")) {
              const replyContent = rep.details.split("[Admin Reply]:").slice(1).join("[Admin Reply]:").trim();
              const replyMsgId = `admin-reply-${rep.id}`;
              const exists = next.some((m) => m.id === replyMsgId);
              if (!exists && replyContent) {
                updatedCount++;
                next.push({
                  id: replyMsgId,
                  sender: "notey",
                  text: `💬 Admin Response:\n${replyContent}`,
                  timestamp: Date.now(),
                });
              }
            }
          });

          // Deduplicated resolved notifications
          const newlyResolved = reports.filter((r) => r.status === "resolved");
          newlyResolved.forEach((r) => {
            const notifId = `resolved-notif-${r.id}`;
            if (!next.some((m) => m.id === notifId)) {
              next.push({
                id: notifId,
                sender: "notey",
                text: `🎉 Good news! Your support ticket (#${r.id.slice(0, 8)}) has been marked as resolved by our admin team. Thank you!`,
                timestamp: Date.now(),
              });
            }
          });
        }

        // Check if there are locally cached admin replies for this ticket (works in local dev testing)
        next.forEach((msg) => {
          if (!msg.ticketId) return;
          try {
            const localRaw = typeof window !== "undefined" ? localStorage.getItem(`np_admin_reply_${msg.ticketId}`) : null;
            if (localRaw) {
              const list = JSON.parse(localRaw) as Array<{ text: string }>;
              list.forEach((item, i) => {
                const localId = `admin-local-reply-${msg.ticketId}-${i}`;
                if (!next.some((m) => m.id === localId || m.text.includes(item.text)) && item.text) {
                  updatedCount++;
                  next.push({
                    id: localId,
                    sender: "notey",
                    text: `💬 Admin Response:\n${item.text}`,
                    timestamp: Date.now(),
                  });
                }
              });
            }
          } catch {}
        });

        return next;
      });

      if (updatedCount > 0) {
        if (!isOpen) {
          setHasUnreadNotification(true);
          try {
            localStorage.setItem("np_has_unread_notif", "true");
          } catch {}
        }
        toast.success(`Updated ${updatedCount} ticket(s) from support!`);
      } else {
        toast.info("All support tickets are up to date.");
      }
    } catch {
      toast.info("All support tickets are up to date.");
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.email, guestEmail, isOpen]);

  // Send message / ticket
  const handleSendMessage = async (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText) return;

    const email = (user?.email || guestEmail).trim();
    if (!email || !email.includes("@")) {
      toast.error("Please provide a valid email so our support team can reply to you.");
      return;
    }

    if (!user?.email && guestEmail) {
      try {
        localStorage.setItem(STORAGE_EMAIL_KEY, guestEmail.trim());
      } catch {
        // ignore
      }
    }

    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: cleanText,
      timestamp: Date.now(),
      ticketStatus: "open",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setIsSending(true);

    try {
      const res = await bff<ReportOut>("contact", {
        method: "POST",
        body: {
          name: user?.display_name || email.split("@")[0] || "Student",
          email,
          message: cleanText,
          reason: "support_chat",
        },
      });

      // Update message with ticket ID
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsgId ? { ...m, ticketId: res.id, ticketStatus: "open" } : m))
      );

      // Automated friendly response from Notey
      const shortId = res.id ? res.id.slice(0, 8) : "LOGGED";
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `notey-${Date.now()}`,
            sender: "notey",
            text: `✅ Got it! Your message has been dispatched to our admin inbox (Ticket #${shortId}). We'll review it shortly. You can tap the 🔄 icon above anytime to check status.`,
            timestamp: Date.now(),
          },
        ]);
      }, 400);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send message. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "notey",
          text: `⚠️ Could not reach support backend right now. Please check your internet or try again in a moment.`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleChipClick = (chip: QuickChip) => {
    if (chip.isGuide) {
      setMode("guide");
      setCurrentStep(0);
      setModalAnim("happy");
      return;
    }

    if (chip.id === "clean_pdf") {
      // Instant answer chip without immediately sending ticket unless user wants
      setMessages((prev) => [
        ...prev,
        {
          id: `chip-${Date.now()}`,
          sender: "user",
          text: chip.promptText,
          timestamp: Date.now(),
        },
        {
          id: `notey-${Date.now() + 1}`,
          sender: "notey",
          text: `All question papers on Notes & Papers are 100% free with clean watermarks and zero spam! Simply open your paper's page and click the yellow "Download PDF" button. If a paper has formatting issues, pick "Report Broken PDF" or message us below!`,
          timestamp: Date.now() + 1,
        },
      ]);
      return;
    }

    setInputText(chip.promptText);
  };

  // Tour navigation
  const currentTour = tourSteps[currentStep] ?? tourSteps[0];
  const handleTourNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setModalAnim(tourSteps[next]?.animation || "excited");
    } else {
      setModalAnim("celebrate");
      setTimeout(() => {
        setMode("chat");
        setMessages((prev) => {
          const alreadyHasTourDone = prev.some((m) => m.text.includes("Tour completed!"));
          if (alreadyHasTourDone) return prev;
          return [
            ...prev,
            {
              id: `tour-fin-${Date.now()}`,
              sender: "notey",
              text: "🎉 Tour completed! You're ready to find and download any paper. Let me know if you need anything else!",
              timestamp: Date.now(),
            },
          ];
        });
      }, 1000);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "notey",
        text: "Hey Scholar! 👋 How can we help you? Pick an option below or type your message.",
        timestamp: Date.now(),
      },
    ]);
    try {
      localStorage.removeItem(STORAGE_CHAT_KEY);
      localStorage.removeItem("np_has_unread_notif");
    } catch {}
    setHasUnreadNotification(false);
    toast.success("Chat history cleared.");
  };

  const handleTourPrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setModalAnim(tourSteps[prev]?.animation || "curious");
    }
  };

  // Hide completely on admin routes
  if (!isMounted || pathname.startsWith("/admin")) return null;

  // On /contact page, hide the floating corner mascot to avoid covering page content
  const isContactPage = pathname === "/contact";

  return (
    <>
      {/* Floating Mascot Button (Bottom-Right, hidden on /contact page) */}
      {!isContactPage && (
        <aside
          aria-label="Notey study companion and support chat"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 select-none"
        >
          <button
            type="button"
            onClick={() => {
              resetInactivity();
              setIsOpen((prev) => {
                const next = !prev;
                if (next) {
                  setHasUnreadNotification(false);
                  try {
                    localStorage.removeItem("np_has_unread_notif");
                  } catch {}
                }
                return next;
              });
              setFloatingAnim("happy");
            }}
            className="group relative flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer drop-shadow-md focus:outline-none"
            title="Open Support Chat & Guide"
            aria-label="Open Support Chat & Guide"
          >
            <NoteyAvatar
              animation={floatingAnim}
              size={58}
              onAnimationEnd={(endedAnim) => {
                if (endedAnim === "waking") setFloatingAnim("idle");
              }}
            />
            {/* Show notification dot ONLY when there is an unread admin reply! */}
            {hasUnreadNotification && (
              <span
                className="absolute top-0 right-0 size-3.5 rounded-full border-2 border-background bg-destructive shadow-hard-xs animate-pulse"
                aria-label="New unread message"
              />
            )}
          </button>
        </aside>
      )}

      {/* Support Chat & Guide Window (Full screen on mobile devices) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-chat-title"
          className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex w-full h-[100dvh] sm:w-[400px] sm:max-w-[400px] sm:h-[580px] sm:max-h-[calc(100dvh-2.5rem)] flex-col border-0 sm:border-2 border-border bg-card shadow-none sm:shadow-hard-lg overflow-hidden animate-in fade-in duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-border bg-muted/40 px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full border-2 border-border bg-primary grid place-items-center shrink-0">
                <NoteyAvatar size={30} animation={mode === "guide" ? modalAnim : "happy"} />
              </div>
              <div className="flex items-center gap-1.5">
                <h2
                  id="support-chat-title"
                  className="font-display text-sm font-black uppercase tracking-wider text-foreground leading-none"
                >
                  Support
                </h2>
                {hasUnreadNotification && (
                  <span
                    className="size-2 rounded-full bg-destructive inline-block animate-pulse"
                    title="Unread reply"
                  />
                )}
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1.5">
              {/* Mode Toggle Button: Guide or Chat */}
              <button
                type="button"
                onClick={() => {
                  if (mode === "guide") {
                    setMode("chat");
                  } else {
                    setMode("guide");
                    setCurrentStep(0);
                    setModalAnim("happy");
                  }
                }}
                className={`inline-flex items-center gap-1 border-2 border-border px-2 py-1 text-[11px] font-black uppercase tracking-wider shadow-hard-sm transition-all hover:bg-muted active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
                  mode === "guide" ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                }`}
                title={mode === "guide" ? "Switch to Support Chat" : "Take Website Tour"}
              >
                <Sparkles className="size-3" aria-hidden="true" />
                <span>{mode === "guide" ? "Chat" : "Guide"}</span>
              </button>

              {/* Clear Chat History */}
              {mode === "chat" && messages.length > 1 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="grid size-7 place-items-center border-2 border-border bg-card text-foreground shadow-hard-sm transition-all hover:bg-muted active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                  title="Clear chat history"
                  aria-label="Clear chat history"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              )}

              {/* Manual Refresh Icon (No automatic polling) */}
              {mode === "chat" && (
                <button
                  type="button"
                  onClick={refreshTicketStatus}
                  disabled={isRefreshing}
                  className="grid size-7 place-items-center border-2 border-border bg-card text-foreground shadow-hard-sm transition-all hover:bg-muted active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                  title="Check for ticket updates"
                  aria-label="Refresh ticket status"
                >
                  <RotateCw
                    className={`size-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-7 place-items-center border-2 border-border bg-card text-foreground shadow-hard-sm transition-all hover:bg-muted active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                title="Close Support"
                aria-label="Close Support dialog"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Body: Guide Mode or Chat Mode */}
          {mode === "guide" ? (
            /* GUIDE TOUR MODE */
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                {/* Progress bar */}
                <div className="flex items-center justify-between border-b-2 border-border pb-2">
                  <span className="eyebrow inline-flex items-center gap-1 border border-border bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm">
                    <Sparkles className="size-2.5" aria-hidden="true" />
                    Tour
                  </span>
                  <span className="eyebrow text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Step {currentStep + 1} of {tourSteps.length} · {currentTour.badge}
                  </span>
                </div>

                {/* Content Row */}
                <div className="flex items-start gap-3 pt-1">
                  <div className="shrink-0">
                    <NoteyAvatar
                      animation={modalAnim}
                      size={54}
                      onAnimationEnd={(endedAnim) => {
                        if (endedAnim === "waking") setModalAnim("happy");
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <h3 className="text-sm font-black uppercase tracking-wide leading-tight break-words">
                      {currentTour.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-foreground/90 font-medium">
                      {currentTour.speech}
                    </p>
                  </div>
                </div>

                {/* Pro Tip Box */}
                <div className="flex items-start gap-2 border-l-2 border-primary bg-muted/40 px-2.5 py-2 text-[11px] text-muted-foreground">
                  <HelpCircle className="size-3.5 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                  <span>{currentTour.tip}</span>
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="border-t-2 border-border pt-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  {currentTour.action ? (
                    <Link
                      href={currentTour.action.href}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 border border-border bg-card px-2 py-1 text-[11px] font-bold uppercase tracking-wider shadow-hard-sm transition-all hover:bg-muted active:translate-x-0.5 active:translate-y-0.5"
                    >
                      <span>{currentTour.action.label}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-1" aria-hidden="true">
                      {tourSteps.map((_, idx) => (
                        <span
                          key={idx}
                          className={`h-1.5 transition-all ${
                            idx === currentStep ? "w-3 bg-primary" : "w-1.5 bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto">
                    {currentStep > 0 && (
                      <button
                        type="button"
                        onClick={handleTourPrev}
                        className="inline-flex items-center gap-1 border-2 border-border bg-card px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow-hard-sm transition-all hover:bg-muted active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                      >
                        <ArrowLeft className="size-3" aria-hidden="true" />
                        <span>Back</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleTourNext}
                      className="inline-flex items-center gap-1 border-2 border-border bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-hard-sm text-primary-foreground transition-all hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      <span>{currentStep === tourSteps.length - 1 ? "Finish" : "Next"}</span>
                      {currentStep === tourSteps.length - 1 ? (
                        <CheckCircle2 className="size-3" aria-hidden="true" />
                      ) : (
                        <ArrowRight className="size-3" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMode("chat")}
                  className="w-full text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground py-1 cursor-pointer"
                >
                  ← Back to Support Chat
                </button>
              </div>
            </div>
          ) : (
            /* SUPPORT CHAT MODE */
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Message History Thread */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[86%] rounded-sm p-2.5 text-xs sm:text-sm font-medium shadow-hard-sm border-2 border-border ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>

                    {/* Status Badge under ticket message */}
                    {msg.ticketId && (
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        <span>Ticket #{msg.ticketId.slice(0, 8)}</span>
                        <span>•</span>
                        {msg.ticketStatus === "resolved" ? (
                          <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                            <CheckCircle2 className="size-3" /> Resolved
                          </span>
                        ) : msg.ticketStatus === "dismissed" ? (
                          <span className="text-muted-foreground">Closed</span>
                        ) : (
                          <span className="text-amber-600 font-extrabold">Open</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Pre-built Question Chips */}
              <div className="border-t-2 border-border bg-muted/20 px-3 py-2 flex flex-wrap gap-1.5">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="inline-flex items-center gap-1 border border-border bg-card hover:bg-primary/20 px-2 py-1 text-[11px] font-bold tracking-tight shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 cursor-pointer transition-colors"
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>

              {/* Guest Email Field (if not signed in) */}
              {!user?.email && (
                <div className="border-t border-border/60 bg-card px-3 py-1.5 flex items-center gap-2">
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Your email (for reply): student@example.com"
                    className="w-full bg-transparent text-xs font-medium focus:outline-none placeholder:text-muted-foreground/60 border-b border-border/40 focus:border-primary py-0.5"
                  />
                </div>
              )}

              {/* Input Area */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="border-t-2 border-border bg-card p-2 sm:p-2.5 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message or request..."
                  disabled={isSending}
                  className="flex-1 border-2 border-border bg-background px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-hard-sm"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="inline-flex size-9 sm:size-10 items-center justify-center border-2 border-border bg-primary text-primary-foreground shadow-hard-sm transition-all hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40 cursor-pointer shrink-0"
                  title="Send message"
                  aria-label="Send message"
                >
                  <Send className="size-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/** Standalone button to trigger Support Chat modal from anywhere on site */
export function SupportChatTrigger({
  label = "Contact Support",
  className,
  question,
}: {
  label?: string;
  className?: string;
  question?: string;
}) {
  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("np:open-support-chat", { detail: { question } })
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "inline-flex items-center gap-1.5 border-2 border-border bg-primary px-3 py-1.5 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-hard-sm hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
      }
    >
      <MessageSquare className="size-3.5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
