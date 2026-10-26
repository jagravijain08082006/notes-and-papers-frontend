"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useMe } from "@/hooks/use-me";
import { NoteyAvatar } from "@/components/account/notey-avatar";

interface TourStep {
  animation: string;
  badge: string;
  title: string;
  speech: string;
  tip: string;
  action?: {
    href: string;
    label: string;
    icon: typeof Search;
  };
}

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function MascotGuide() {
  const pathname = usePathname();
  const { data: user } = useMe();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [floatingAnim, setFloatingAnim] = useState("idle");
  const [modalAnim, setModalAnim] = useState("happy");
  const [hasInteracted, setHasInteracted] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = `np_mascot_tour_${user?.id || "guest"}`;
  const userName = user?.display_name?.split(" ")[0] || "Scholar";

  const steps: TourStep[] = [
    {
      animation: "happy",
      badge: "Welcome",
      title: `Welcome, ${userName}! Meet Notey 👋`,
      speech:
        "I'm Notey, your personal study companion at Notes & Papers! Our vault features over 7,800+ previous year question papers for Rajasthan University (UNIRAJ), RTU Kota, UPSC, and state boards—100% free with clean, watermark-free PDFs.",
      tip: "Let's take a quick 45-second tour of how to get the most out of your vault.",
      action: {
        href: "/universities",
        label: "Browse Universities",
        icon: BookOpen,
      },
    },
    {
      animation: "searching",
      badge: "Finding Papers",
      title: "1. Lightning-Fast Paper Search",
      speech:
        "Looking for a specific subject or semester? You can search by course (BCA, BSc, B.Tech, BCom), semester number, or exact paper code (like 6E7102 or 2-4E2032).",
      tip: "Pro Tip: Use the top search bar anytime to jump straight to your subject.",
      action: {
        href: "/search",
        label: "Try Search",
        icon: Search,
      },
    },
    {
      animation: "proud",
      badge: "Clean PDFs",
      title: "2. Clean, Watermark-Free Downloads",
      speech:
        "Every question paper can be previewed directly inside your browser before downloading. No annoying watermarks covering formulas or diagrams.",
      tip: "All papers you download are logged under your 'Downloads' tab for instant offline reference.",
      action: {
        href: "/downloads",
        label: "View Downloads",
        icon: BookOpen,
      },
    },
    {
      animation: "excited",
      badge: "Bookmarks",
      title: "3. Save Target Papers with Bookmarks",
      speech:
        "Preparing for upcoming end-semesters or midterms? Click the bookmark ribbon on any paper to save it to your personal vault for fast revision anytime.",
      tip: "Keep all your exam papers grouped in one place so you never lose them before exam night.",
      action: {
        href: "/bookmarks",
        label: "My Bookmarks",
        icon: BookOpen,
      },
    },
    {
      animation: "working",
      badge: "Community",
      title: "4. Share Papers & Notes with Peers",
      speech:
        "Got recent semester question papers or clean handwritten revision notes? Click 'Upload' to share them! Every submission is reviewed by moderators and credited to you.",
      tip: "Help fellow students in your college and expand the open academic vault together.",
      action: {
        href: "/upload",
        label: "Upload a Paper",
        icon: Upload,
      },
    },
    {
      animation: "celebrate",
      badge: "Ready!",
      title: "5. You're All Set to Excel!",
      speech:
        "Take a moment to update your university and college in your profile below. That helps us tailor course recommendations to your degree. Click on me at the side of your screen anytime for a reminder!",
      tip: "Good luck with your exam preparations—let's turn your study sessions into success!",
    },
  ];

  // Inactivity on floating mascot: switches to drowsy -> sleeping after 30s
  const resetInactivity = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setFloatingAnim("drowsy");
      setTimeout(() => {
        setFloatingAnim("sleeping");
      }, 4000);
    }, 30000);
  }, []);

  const closeModal = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // storage unavailable
    }
    setIsOpen(false);
    setFloatingAnim("idle");
  }, [storageKey]);

  useEffect(() => {
    // Only check for auto-open if not in admin
    if (pathname.startsWith("/admin")) return;

    let hasSeen = false;
    try {
      hasSeen = localStorage.getItem(storageKey) === "true";
    } catch {
      hasSeen = false;
    }

    if (!hasSeen) {
      // Auto-open modal once per user on their first visit
      const timer = setTimeout(() => {
        setIsOpen(true);
        setModalAnim("waking");
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [storageKey, pathname]);

  useEffect(() => {
    const handleActivity = () => {
      resetInactivity();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeModal, resetInactivity]);

  // Hide on admin routes completely
  if (!isMounted || pathname.startsWith("/admin")) return null;

  const current = steps[currentStep] ?? steps[0];

  const openModal = () => {
    resetInactivity();
    setHasInteracted(true);
    setCurrentStep(0);
    setModalAnim("happy");
    setIsOpen(true);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setModalAnim(steps[nextStep]?.animation || "excited");
    } else {
      finishTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setModalAnim(steps[prevStep]?.animation || "curious");
    }
  };

  const finishTour = () => {
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // storage unavailable
    }
    setModalAnim("celebrate");
    setTimeout(() => {
      closeModal();
    }, 1500);
  };

  return (
    <>
      {/* Intact Floating Mascot at the Side of the Screen (All pages except admin) */}
      <aside
        aria-label="Notey study companion"
        className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-1.5 sm:bottom-6 sm:right-6 pointer-events-auto"
      >
        {/* Floating Speech Prompt / Tooltip */}
        {!hasInteracted && !isOpen && (
          <button
            type="button"
            onClick={openModal}
            className="group flex items-center gap-1.5 border-2 border-border bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 cursor-pointer animate-bounce [animation-duration:3s]"
            title="Click Notey for website guide"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            <span>Guide Tour</span>
          </button>
        )}

        {/* Mascot Avatar Widget */}
        <div className="relative group">
          <NoteyAvatar
            animation={floatingAnim}
            size={84}
            onClick={openModal}
            onAnimationEnd={(endedAnim) => {
              if (endedAnim === "waking") setFloatingAnim("idle");
            }}
            className="transition-transform hover:scale-110 active:scale-95 drop-shadow-lg"
          />
          <span className="sr-only">Open website tour guide</span>
        </div>
      </aside>

      {/* Website Tour Modal Dialog */}
      {isOpen && (
        <div
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-tour-heading"
            className="relative w-full max-w-2xl border-2 sm:border-4 border-border bg-card p-5 sm:p-7 shadow-hard-lg space-y-6 my-auto"
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b-2 border-border pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="eyebrow inline-flex items-center gap-1.5 border-2 border-border bg-primary px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Study Companion
                </span>
                <span className="eyebrow text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Step {currentStep + 1} of {steps.length} · {current.badge}
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeModal}
                className="grid size-8 place-items-center border-2 border-border bg-card text-foreground transition-all hover:bg-muted hover:shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                title="Close guide"
                aria-label="Close guide modal"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Center: Mascot + Speech Bubble */}
            <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
              {/* Animated Mascot */}
              <div className="flex flex-col items-center justify-center gap-2">
                <NoteyAvatar
                  animation={modalAnim}
                  size={135}
                  onAnimationEnd={(endedAnim) => {
                    if (endedAnim === "waking") setModalAnim("happy");
                  }}
                />
                <span className="eyebrow text-[10px] uppercase tracking-wider text-muted-foreground">
                  Notey
                </span>
              </div>

              {/* Interactive Speech Card */}
              <div className="relative border-2 border-border bg-background p-4 sm:p-5 shadow-hard-sm space-y-3.5">
                {/* Speech bubble pointer on desktop */}
                <div
                  className="hidden sm:block absolute -left-2.5 top-1/2 -translate-y-1/2 size-4 rotate-45 border-l-2 border-b-2 border-border bg-background"
                  aria-hidden="true"
                />

                <div className="space-y-2">
                  <h2
                    id="modal-tour-heading"
                    className="text-xl sm:text-2xl font-bold uppercase tracking-wide leading-tight"
                  >
                    {current.title}
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/90 font-medium">
                    {current.speech}
                  </p>
                </div>

                {/* Pro Tip Box */}
                <div className="flex items-start gap-2 border border-border/50 bg-muted/30 p-2.5 text-xs text-muted-foreground">
                  <HelpCircle className="size-4 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                  <span>{current.tip}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-border pt-4">
              {/* Optional Quick Link */}
              {current.action ? (
                <Link
                  href={current.action.href}
                  onClick={closeModal}
                  className="inline-flex items-center gap-1.5 border-2 border-border bg-card px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-muted active:translate-x-0.5 active:translate-y-0.5"
                >
                  <current.action.icon className="size-3.5" aria-hidden="true" />
                  <span>{current.action.label}</span>
                </Link>
              ) : (
                <span />
              )}

              {/* Step Navigation */}
              <div className="flex items-center gap-2 ml-auto">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1 border-2 border-border bg-card px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-muted active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                  >
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  onMouseEnter={() => setModalAnim("excited")}
                  onMouseLeave={() => setModalAnim(current.animation)}
                  className="inline-flex items-center gap-1.5 border-2 border-border bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-hard-sm text-primary-foreground transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <span>{currentStep === steps.length - 1 ? "Finish Tour" : "Next Step"}</span>
                  {currentStep === steps.length - 1 ? (
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
