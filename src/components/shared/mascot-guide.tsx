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
      title: `Welcome, ${userName}! 👋`,
      speech:
        "I'm Notey, your study guide! Notes & Papers gives you 7,800+ previous year papers for Rajasthan University (UNIRAJ), RTU Kota, and competitive exams—100% free with clean, watermark-free PDFs.",
      tip: "Everything is free with your student account.",
      action: {
        href: "/universities",
        label: "Browse Universities",
        icon: BookOpen,
      },
    },
    {
      animation: "searching",
      badge: "Search",
      title: "1. Instant Paper Search 🔍",
      speech:
        "Search papers by course (BCA, BSc, B.Tech, BCom), semester number, or exact paper code (like 6E7102 or 2-4E2032).",
      tip: "Use the top search bar anytime to jump straight to your subject.",
      action: {
        href: "/search",
        label: "Try Search",
        icon: Search,
      },
    },
    {
      animation: "proud",
      badge: "Clean PDFs",
      title: "2. Clean Watermark-Free PDFs 📄",
      speech:
        "Preview every question paper in your browser before saving. All downloads are clean and high-resolution with zero watermarks.",
      tip: "Downloaded papers stay organized in your Downloads tab.",
      action: {
        href: "/downloads",
        label: "My Downloads",
        icon: BookOpen,
      },
    },
    {
      animation: "excited",
      badge: "Bookmarks",
      title: "3. Bookmark for Exam Revision 🔖",
      speech:
        "Preparing for upcoming midterms or finals? Tap the bookmark ribbon on any paper to save it to your personal vault for fast revision.",
      tip: "Keep all your exam papers in one place before exam night.",
      action: {
        href: "/bookmarks",
        label: "My Bookmarks",
        icon: BookOpen,
      },
    },
    {
      animation: "working",
      badge: "Uploads",
      title: "4. Share Papers & Study Notes 🚀",
      speech:
        "Have recent semester papers or clean handwritten notes? Tap 'Upload' to share. Every upload is verified and credited to you!",
      tip: "Help fellow students in your college succeed together.",
      action: {
        href: "/upload",
        label: "Upload a Paper",
        icon: Upload,
      },
    },
    {
      animation: "celebrate",
      badge: "All Set!",
      title: "5. You're Ready to Ace Exams! 🎓",
      speech:
        "Update your university and college in your profile to get tailored recommendations. Tap me at the side of your screen anytime for a refresher!",
      tip: "Good luck with your exam preparations!",
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
    if (pathname.startsWith("/admin")) return;

    let hasSeen = false;
    try {
      hasSeen = localStorage.getItem(storageKey) === "true";
    } catch {
      hasSeen = false;
    }

    if (!hasSeen) {
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

  // Hide completely on admin routes
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
    }, 1400);
  };

  return (
    <>
      {/* Intact Floating Mascot at the Side of the Screen */}
      <aside
        aria-label="Notey study companion"
        className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-1.5 sm:bottom-6 sm:right-6 pointer-events-auto"
      >
        {/* Floating Speech Prompt / Tooltip */}
        {!hasInteracted && !isOpen && (
          <button
            type="button"
            onClick={openModal}
            className="group flex items-center gap-1.5 border-2 border-border bg-primary px-2.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 cursor-pointer animate-bounce [animation-duration:3.5s]"
            title="Click Notey for quick site guide"
          >
            <Sparkles className="size-3" aria-hidden="true" />
            <span>Site Guide</span>
          </button>
        )}

        {/* Mascot Avatar Widget (Compact on mobile) */}
        <div className="relative group">
          <NoteyAvatar
            animation={floatingAnim}
            size={64}
            onClick={openModal}
            onAnimationEnd={(endedAnim) => {
              if (endedAnim === "waking") setFloatingAnim("idle");
            }}
            className="transition-transform hover:scale-110 active:scale-95 drop-shadow-md cursor-pointer"
          />
          <span className="sr-only">Open website tour guide</span>
        </div>
      </aside>

      {/* Website Tour Modal Dialog (Mobile-Optimized & Clean) */}
      {isOpen && (
        <div
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-3.5 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-tour-heading"
            className="relative w-full max-w-lg border-2 sm:border-3 border-border bg-card p-4 sm:p-6 shadow-hard-lg space-y-4 my-auto max-h-[92dvh] overflow-y-auto"
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="eyebrow inline-flex items-center gap-1 border border-border bg-primary px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm">
                  <Sparkles className="size-3" aria-hidden="true" />
                  Guide
                </span>
                <span className="eyebrow text-[11px] sm:text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {currentStep + 1} of {steps.length} · {current.badge}
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeModal}
                className="grid size-7 sm:size-8 place-items-center border-2 border-border bg-card text-foreground transition-all hover:bg-muted hover:shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                title="Close guide"
                aria-label="Close guide modal"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* Mobile-Friendly Main Row: Mascot alongside Content */}
            <div className="flex items-start gap-3.5 sm:gap-5">
              {/* Animated Mascot (Compact 72px on mobile, 96px on desktop) */}
              <div className="flex flex-col items-center justify-center shrink-0 pt-1">
                <NoteyAvatar
                  animation={modalAnim}
                  size={76}
                  onAnimationEnd={(endedAnim) => {
                    if (endedAnim === "waking") setModalAnim("happy");
                  }}
                />
                <span className="eyebrow mt-1 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Notey
                </span>
              </div>

              {/* Speech & Title Content (No clunky nested boxes) */}
              <div className="flex-1 min-w-0 space-y-2.5">
                <h2
                  id="modal-tour-heading"
                  className="text-lg sm:text-xl font-bold uppercase tracking-wide leading-snug break-words"
                >
                  {current.title}
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 font-medium">
                  {current.speech}
                </p>
              </div>
            </div>

            {/* Pro Tip Box: Clean border-l accent */}
            <div className="flex items-start gap-2 border-l-2 border-primary bg-muted/40 px-3 py-2 text-[11px] sm:text-xs text-muted-foreground">
              <HelpCircle className="size-3.5 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
              <span>{current.tip}</span>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between gap-2 border-t-2 border-border pt-3">
              {/* Optional Quick Link */}
              {current.action ? (
                <Link
                  href={current.action.href}
                  onClick={closeModal}
                  className="inline-flex items-center gap-1.5 border-2 border-border bg-card px-2.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-hard-sm transition-all hover:bg-muted active:translate-x-0.5 active:translate-y-0.5"
                >
                  <current.action.icon className="size-3" aria-hidden="true" />
                  <span>{current.action.label}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-1" aria-hidden="true">
                  {steps.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 transition-all ${
                        idx === currentStep ? "w-4 bg-primary" : "w-1.5 bg-muted"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Step Navigation Buttons */}
              <div className="flex items-center gap-1.5 ml-auto">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1 border-2 border-border bg-card px-2.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-hard-sm transition-all hover:bg-muted active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                  >
                    <ArrowLeft className="size-3" aria-hidden="true" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  onMouseEnter={() => setModalAnim("excited")}
                  onMouseLeave={() => setModalAnim(current.animation)}
                  className="inline-flex items-center gap-1 border-2 border-border bg-primary px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-hard-sm text-primary-foreground transition-all hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <span>{currentStep === steps.length - 1 ? "Finish" : "Next"}</span>
                  {currentStep === steps.length - 1 ? (
                    <CheckCircle2 className="size-3" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="size-3" aria-hidden="true" />
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
