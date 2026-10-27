"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
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
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const userName = user?.display_name?.split(" ")[0] || "Scholar";

  const steps: TourStep[] = [
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
    setIsOpen(false);
    setFloatingAnim("idle");
  }, []);

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
    setModalAnim("celebrate");
    setTimeout(() => {
      closeModal();
    }, 1200);
  };

  return (
    <>
      {/* Intact Floating Mascot at the Bottom-Right Corner (All pages except admin) */}
      <aside
        aria-label="Notey study companion"
        className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6 select-none"
      >
        <NoteyAvatar
          animation={floatingAnim}
          size={56}
          onClick={openModal}
          onAnimationEnd={(endedAnim) => {
            if (endedAnim === "waking") setFloatingAnim("idle");
          }}
          className="rounded-full border-2 border-border bg-primary p-0.5 shadow-hard transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
        />
      </aside>

      {/* Website Tour Modal Dialog (Mobile-Optimized & Simple) */}
      {isOpen && (
        <div
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-3.5 sm:p-4 animate-in fade-in duration-150"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-tour-heading"
            className="relative w-full max-w-sm sm:max-w-md border-2 border-border bg-card p-4 sm:p-5 shadow-hard-lg space-y-3.5"
          >
            {/* Top Bar: Progress Badge & Close Button */}
            <div className="flex items-center justify-between border-b-2 border-border pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="eyebrow inline-flex items-center gap-1 border border-border bg-primary px-1.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-hard-sm">
                  <Sparkles className="size-2.5 sm:size-3" aria-hidden="true" />
                  Guide
                </span>
                <span className="eyebrow text-[11px] sm:text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {currentStep + 1} of {steps.length} · {current.badge}
                </span>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="grid size-7 place-items-center border-2 border-border bg-card text-foreground transition-all hover:bg-muted active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                title="Close guide"
                aria-label="Close guide modal"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Main Content Row: Mascot + Speech */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="shrink-0 pt-0.5">
                <NoteyAvatar
                  animation={modalAnim}
                  size={58}
                  onAnimationEnd={(endedAnim) => {
                    if (endedAnim === "waking") setModalAnim("happy");
                  }}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <h2
                  id="modal-tour-heading"
                  className="text-base sm:text-lg font-bold uppercase tracking-wide leading-tight break-words"
                >
                  {current.title}
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 font-medium">
                  {current.speech}
                </p>
              </div>
            </div>

            {/* Pro Tip Box */}
            <div className="flex items-start gap-2 border-l-2 border-primary bg-muted/40 px-2.5 py-1.5 text-[11px] sm:text-xs text-muted-foreground">
              <HelpCircle className="size-3.5 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
              <span>{current.tip}</span>
            </div>

            {/* Footer Row: Progress Dots + Navigation */}
            <div className="flex items-center justify-between gap-2 border-t-2 border-border pt-3">
              {/* Optional Quick Link or Progress Dots */}
              {current.action ? (
                <Link
                  href={current.action.href}
                  onClick={closeModal}
                  className="inline-flex items-center gap-1 border border-border bg-card px-2 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-hard-sm transition-all hover:bg-muted active:translate-x-0.5 active:translate-y-0.5"
                >
                  <span>{current.action.label}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-1" aria-hidden="true">
                  {steps.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 transition-all ${
                        idx === currentStep ? "w-3 bg-primary" : "w-1.5 bg-muted"
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
