"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  MessageCircle,
  RotateCw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { NoteyAvatar } from "@/components/account/notey-avatar";
import { useMe } from "@/hooks/use-me";
import type { ChatMessageItem, GuestChatState, Me } from "@/lib/api/types";
import { BffError, bff } from "@/services/api-client";

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

const QUICK_CHIPS = [
  {
    id: "guide",
    label: "Tour",
    icon: "✨",
    promptText: "",
    isGuide: true,
  },
  {
    id: "missing_paper",
    label: "Request Paper",
    icon: "📄",
    promptText: "Hi, I need a question paper: ",
  },
  {
    id: "broken_pdf",
    label: "Report Issue",
    icon: "⚠️",
    promptText: "Hi, there is an issue with a paper: ",
  },
];

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function fmtMsgTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function SupportChat() {
  const { data: user, isPending } = useMe();
  const pathname = usePathname();
  // Reset private state on account changes and reopen chat on the return route after login.
  return (
    <SupportChatWidget
      key={`${user?.id ?? "signed-out"}:${pathname}`}
      user={user ?? null}
      isPending={isPending}
    />
  );
}

function SupportChatWidget({ user, isPending }: { user: Me | null; isPending: boolean }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const isMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  const [isOpen, setIsOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("support") === "chat",
  );
  const [mode, setMode] = useState<"chat" | "guide">("chat");
  const [floatingAnim, setFloatingAnim] = useState("idle");
  const [modalAnim, setModalAnim] = useState("happy");
  const [currentStep, setCurrentStep] = useState(0);

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendingRef = useRef(false);
  const revisionRef = useRef(0);

  const userName = user?.display_name?.split(" ")[0] || "Scholar";
  const handleSessionError = useCallback(
    (error: unknown) => {
      if (error instanceof BffError && (error.status === 401 || error.status === 403)) {
        queryClient.setQueryData(["me"], null);
      }
    },
    [queryClient],
  );

  const tourSteps: TourStep[] = [
    {
      animation: "happy",
      badge: "Welcome",
      title: `Welcome, ${userName}! 👋`,
      speech:
        "I'm Notey, your study companion! Notes & Papers gives you 7,800+ previous year papers for RTU Kota, UNIRAJ, School Boards & Competitive Exams—100% free with clean PDFs.",
      tip: "Everything is free—zero paywalls or ads.",
      action: { href: "/universities", label: "Browse Universities" },
    },
    {
      animation: "searching",
      badge: "Search",
      title: "Instant Paper Search 🔍",
      speech:
        "Quickly find papers by course (B.Tech, BCA, BSc, BCom), semester number, or exact subject code.",
      tip: "Use the top search bar anytime to jump right to your subject.",
      action: { href: "/search", label: "Try Search" },
    },
    {
      animation: "proud",
      badge: "Downloads",
      title: "Clean Watermark-Free PDFs 📄",
      speech:
        "Preview every paper in your browser before downloading. High-resolution and exam-ready.",
      tip: "Signed-in users can view past downloads in their profile.",
      action: { href: "/downloads", label: "My Downloads" },
    },
    {
      animation: "excited",
      badge: "Bookmarks",
      title: "Save For Exam Night 🔖",
      speech:
        "Tap the bookmark icon on any paper to save it to your personal vault for fast revision.",
      tip: "Keep all your important papers organized in one place.",
      action: { href: "/bookmarks", label: "My Bookmarks" },
    },
  ];

  // Manual refresh button handler
  const handleManualRefresh = async () => {
    if (!user || sendingRef.current) return;
    const revision = ++revisionRef.current;
    setIsSyncing(true);
    try {
      const state = await bff<GuestChatState>("chat?mark_read=true");
      if (revision === revisionRef.current && state && Array.isArray(state.messages)) {
        setMessages(state.messages);
        setUnreadCount(0);
      }
    } catch (error) {
      handleSessionError(error);
      toast.error("Could not refresh messages. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Keep inner message viewport scrolled to bottom (never jumps outer window)
  useEffect(() => {
    if (isOpen && mode === "chat" && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen, mode]);

  // Poll only for signed-in accounts; never acknowledge replies in a hidden tab.
  useEffect(() => {
    if (!isMounted || !user || pathname.startsWith("/admin")) return;

    let cancelled = false;
    let inFlight = false;
    const poll = () => {
      if (inFlight || sendingRef.current || document.visibilityState !== "visible") return;
      const markRead = isOpen && mode === "chat";
      const revision = ++revisionRef.current;
      inFlight = true;
      bff<GuestChatState>(markRead ? "chat?mark_read=true" : "chat")
        .then((state) => {
          if (
            cancelled ||
            revision !== revisionRef.current ||
            sendingRef.current ||
            !state ||
            !Array.isArray(state.messages)
          )
            return;
          setMessages(state.messages);
          setUnreadCount(markRead ? 0 : state.unread_by_guest || 0);
        })
        .catch((error) => {
          if (!cancelled) handleSessionError(error);
        })
        .finally(() => {
          inFlight = false;
        });
    };

    poll();

    const timer = setInterval(poll, isOpen ? 4000 : 25000);

    const handleResume = () => poll();

    window.addEventListener("focus", handleResume);
    document.addEventListener("visibilitychange", handleResume);

    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener("focus", handleResume);
      document.removeEventListener("visibilitychange", handleResume);
    };
  }, [isMounted, pathname, isOpen, mode, user, handleSessionError]);

  // Mascot inactivity & custom events
  const resetInactivity = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setFloatingAnim("drowsy");
      setTimeout(() => setFloatingAnim("sleeping"), 4000);
    }, 30000);
  }, []);

  useEffect(() => {
    const handleOpenSupport = (e: Event) => {
      const custom = e as CustomEvent<{ question?: string }>;
      setIsOpen(true);
      setMode("chat");
      setUnreadCount(0);
      setFloatingAnim("happy");
      if (custom.detail?.question) setInputText(custom.detail.question);
    };

    const handleOpenGuide = () => {
      setIsOpen(true);
      setMode("guide");
      setCurrentStep(0);
      setModalAnim("happy");
    };

    const handleActivity = () => resetInactivity();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
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

  const handleSendMessage = async (rawText: string) => {
    const cleanText = rawText.trim();
    if (!user || !cleanText || cleanText.length > 2000 || sendingRef.current) return;
    sendingRef.current = true;
    revisionRef.current++;

    const optimisticId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessageItem = {
      id: optimisticId,
      sender: "guest",
      text: cleanText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");
    setIsSending(true);

    try {
      const state = await bff<GuestChatState>("chat/messages", {
        method: "POST",
        body: {
          text: cleanText,
        },
      });
      if (state && Array.isArray(state.messages)) {
        setMessages(state.messages);
        setUnreadCount(0);
      }
    } catch (e) {
      handleSessionError(e);
      toast.error(e instanceof Error ? e.message : "Could not send message. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setInputText(cleanText);
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  };

  const handleChipClick = (chip: (typeof QUICK_CHIPS)[number]) => {
    if (chip.isGuide) {
      setMode("guide");
      setCurrentStep(0);
      setModalAnim("happy");
      return;
    }
    setInputText(chip.promptText);
  };

  const currentTour = tourSteps[currentStep] ?? tourSteps[0];
  const handleTourNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setModalAnim(tourSteps[next]?.animation || "excited");
    } else {
      setMode("chat");
    }
  };

  const handleTourPrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setModalAnim(tourSteps[prev]?.animation || "curious");
    }
  };

  if (!isMounted || pathname.startsWith("/admin")) return null;
  const isContactPage = pathname === "/contact";
  const returnUrl = new URL(window.location.href);
  returnUrl.searchParams.set("support", "chat");
  const loginHref = `/login?next=${encodeURIComponent(returnUrl.pathname + returnUrl.search)}`;

  return (
    <>
      {/* Floating Mascot Trigger */}
      {!isContactPage && (
        <aside
          aria-label="Notey study companion and support chat"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 select-none"
        >
          <button
            type="button"
            onClick={() => {
              resetInactivity();
              setIsOpen((prev) => !prev);
              setUnreadCount(0);
              setFloatingAnim("happy");
            }}
            className="group relative flex size-12 items-center justify-center rounded-full border-2 border-border bg-primary text-primary-foreground shadow-hard-sm sm:size-auto sm:border-0 sm:bg-transparent sm:shadow-none transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Chat with Support"
            aria-label="Chat with Support"
          >
            <MessageCircle className="size-5 sm:hidden" aria-hidden="true" />
            <span className="hidden sm:block">
              <NoteyAvatar
                animation={floatingAnim}
                size={58}
                onAnimationEnd={(endedAnim) => {
                  if (endedAnim === "waking") setFloatingAnim("idle");
                }}
              />
            </span>
            {user && unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 z-10 min-w-5 h-5 px-1 rounded-full border-2 border-background bg-foreground text-background text-[10px] font-black grid place-items-center shadow-hard-xs animate-bounce"
                aria-label={`${unreadCount} unread message`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </aside>
      )}

      {/* Clean Chat / Guide Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-chat-title"
          className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex w-full h-[100dvh] sm:w-[390px] sm:max-w-[390px] sm:h-[540px] sm:max-h-[calc(100dvh-2.5rem)] flex-col border-0 sm:border-2 border-border bg-card shadow-none sm:shadow-hard-lg overflow-hidden animate-in fade-in duration-150"
        >
          {/* Minimal Header */}
          <div className="flex items-center justify-between border-b-2 border-border bg-muted/40 px-3.5 py-2.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full border-2 border-border bg-primary grid place-items-center shrink-0">
                <NoteyAvatar size={30} animation={mode === "guide" ? modalAnim : "happy"} />
              </div>
              <div>
                <h2
                  id="support-chat-title"
                  className="font-display text-sm font-black uppercase tracking-wider text-foreground leading-none"
                >
                  Support Chat
                </h2>
                <p className="hidden text-[11px] text-muted-foreground font-medium mt-0.5 sm:block">
                  Direct 1-on-1 help with our team
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
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
                className={`hidden sm:inline-flex items-center gap-1 border-2 border-border px-2 py-1 text-[11px] font-black uppercase tracking-wider shadow-hard-sm transition-all hover:bg-muted active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
                  mode === "guide"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground"
                }`}
                title={mode === "guide" ? "Back to Chat" : "Take Website Tour"}
              >
                <Sparkles className="size-3" aria-hidden="true" />
                <span>{mode === "guide" ? "Chat" : "Guide"}</span>
              </button>

              {mode === "chat" && user && (
                <button
                  type="button"
                  onClick={() => void handleManualRefresh()}
                  disabled={isSyncing}
                  className="grid size-7 place-items-center border-2 border-border bg-card text-foreground shadow-hard-sm transition-all hover:bg-muted active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                  title="Refresh messages"
                  aria-label="Refresh messages"
                >
                  <RotateCw
                    className={`size-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-7 place-items-center border-2 border-border bg-card text-foreground shadow-hard-sm transition-all hover:bg-muted active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                title="Close chat"
                aria-label="Close Support chat"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Body: Guide Mode OR Clean 1-on-1 Chat */}
          {mode === "guide" ? (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b-2 border-border pb-2">
                  <span className="eyebrow inline-flex items-center gap-1 border border-border bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm">
                    <Sparkles className="size-2.5" aria-hidden="true" />
                    Tour
                  </span>
                  <span className="eyebrow text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Step {currentStep + 1} of {tourSteps.length} · {currentTour.badge}
                  </span>
                </div>

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

                <div className="flex items-start gap-2 border-l-2 border-primary bg-muted/40 px-2.5 py-2 text-[11px] text-muted-foreground">
                  <HelpCircle
                    className="size-3.5 shrink-0 mt-0.5 text-primary"
                    aria-hidden="true"
                  />
                  <span>{currentTour.tip}</span>
                </div>
              </div>

              <div className="border-t-2 border-border pt-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  {currentTour.action && (
                    <Link
                      href={currentTour.action.href}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 border border-border bg-card px-2 py-1 text-[11px] font-bold uppercase tracking-wider shadow-hard-sm transition-all hover:bg-muted active:translate-x-0.5 active:translate-y-0.5"
                    >
                      <span>{currentTour.action.label}</span>
                    </Link>
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
                      <span>{currentStep === tourSteps.length - 1 ? "Done" : "Next"}</span>
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
                  ← Back to Chat
                </button>
              </div>
            </div>
          ) : isPending ? (
            <div
              role="status"
              className="flex-1 grid place-items-center p-5 text-sm text-muted-foreground"
            >
              Checking your account...
            </div>
          ) : !user ? (
            <div className="flex flex-1 flex-col justify-center gap-4 p-5">
              <h3 className="text-lg font-black uppercase">Log in to chat</h3>
              <p className="text-sm text-muted-foreground">
                Chat with our support team using your account. Your name, email and conversation
                stay together so we can help you.
              </p>
              <Link
                href={loginHref}
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-11 items-center justify-center border-2 border-border bg-primary px-4 py-2 text-sm font-bold uppercase text-primary-foreground shadow-hard-sm"
              >
                Log in to continue
              </Link>
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Message Feed */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-muted/10"
              >
                {messages.length === 0 ? (
                  <div className="border-2 border-border bg-card p-3.5 shadow-hard-xs space-y-2">
                    <p className="text-xs sm:text-sm font-bold text-foreground">
                      Hey {userName}! 👋 Need a paper or have a question?
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Send a message below and we&apos;ll reply right here in this chat.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isGuest = msg.sender === "guest";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isGuest ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 px-1">
                          <span>{isGuest ? "You" : "Admin"}</span>
                          {msg.created_at && (
                            <>
                              <span>·</span>
                              <span>{fmtMsgTime(msg.created_at)}</span>
                            </>
                          )}
                        </div>
                        <div
                          className={`max-w-[85%] rounded-sm px-3 py-2 text-xs sm:text-sm font-medium border-2 border-border shadow-hard-xs ${
                            isGuest
                              ? "bg-primary text-primary-foreground"
                              : "bg-card text-foreground"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed break-words">
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Compact Helper Chips */}
              <div className="border-t-2 border-border bg-muted/20 px-3 py-2 flex flex-wrap gap-1.5 shrink-0">
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

              <p className="border-t border-border/60 px-3 py-1.5 text-xs text-muted-foreground truncate">
                Chatting as {user.display_name || user.email || "Student"}
              </p>

              {/* Simple Message Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSendMessage(inputText);
                }}
                className="border-t-2 border-border bg-card p-2 sm:p-2.5 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Write a message..."
                  aria-label="Your message"
                  maxLength={2000}
                  disabled={isSending}
                  className="flex-1 min-w-0 border-2 border-border bg-background px-3 py-2 text-base sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-hard-sm"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="grid size-10 shrink-0 place-items-center border-2 border-border bg-primary text-primary-foreground shadow-hard-sm transition-all hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40 cursor-pointer"
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

/** Button trigger exported for use inside /contact or paper pages to open the live chat. */
export function SupportChatTrigger({
  question,
  label = "Open Support Chat",
  className = "",
}: {
  question?: string;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("np:open-support-chat", { detail: { question } }));
      }}
      className={className}
    >
      <span>{label}</span>
    </button>
  );
}
