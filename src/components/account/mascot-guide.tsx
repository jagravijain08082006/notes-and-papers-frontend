"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { NoteyAvatar } from "./notey-avatar";

interface MascotGuideProps {
  user?: {
    id?: string;
    display_name?: string | null;
    email?: string | null;
  };
}

interface TourStep {
  animation: string;
  title: string;
  speech: string;
  tip: string;
  action?: {
    href: string;
    label: string;
    icon: typeof Search;
  };
}

const FUN_STUDY_TIPS = [
  "Solving the last 5 years of PYQs covers up to 80% of common university exam patterns!",
  "Make short formula notes from repeated 10-mark questions for rapid morning revision.",
  "Always check the paper code on top of your exam sheet to match syllabus revisions.",
  "Reviewing previous semester question formats cuts down exam day anxiety significantly!",
  "Clean watermark-free PDFs save ink and look crystal-clear when printed out.",
];

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function MascotGuide({ user }: MascotGuideProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [anim, setAnim] = useState("idle");
  const [bubbleTip, setBubbleTip] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = `np_mascot_tour_${user?.id || "guest"}`;
  const userName = user?.display_name?.split(" ")[0] || "Scholar";

  const steps: TourStep[] = [
    {
      animation: "happy",
      title: `Welcome, ${userName}! Meet Notey 👋`,
      speech:
        "I'm Notey, your personal study companion at Notes & Papers! Our vault has over 7,800+ previous year question papers for Rajasthan University (UNIRAJ), RTU Kota, UPSC, and state boards—100% free with clean, watermark-free PDFs.",
      tip: "Let's take a quick 45-second tour of how to get the most out of your vault.",
      action: {
        href: "/universities",
        label: "Browse Universities",
        icon: BookOpen,
      },
    },
    {
      animation: "searching",
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
      title: "2. Clean, Watermark-Free Downloads",
      speech:
        "Every question paper in the vault can be previewed directly inside your browser before downloading. No annoying watermarks covering formulas or diagrams.",
      tip: "All papers you download are logged under your 'Downloads' tab for instant offline reference.",
      action: {
        href: "/downloads",
        label: "View Downloads",
        icon: BookOpen,
      },
    },
    {
      animation: "excited",
      title: "3. Save Target Papers with Bookmarks",
      speech:
        "Preparing for upcoming end-semesters or midterm tests? Click the bookmark ribbon on any paper to save it to your personal vault for fast revision anytime.",
      tip: "Keep all your exam papers grouped in one place so you never lose them before exam night.",
      action: {
        href: "/bookmarks",
        label: "My Bookmarks",
        icon: BookOpen,
      },
    },
    {
      animation: "working",
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
      title: "5. You're All Set to Excel!",
      speech:
        "Take a moment to update your university and college in your profile below. That helps us tailor course recommendations to your degree. Click on me anytime if you ever want a reminder!",
      tip: "Good luck with your exam preparations—let's turn your study sessions into success!",
    },
  ];

  // Inactivity reaction: after 30 seconds of no interaction, mascot gets drowsy -> sleeping
  const resetInactivity = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setAnim("drowsy");
      setTimeout(() => {
        setAnim("sleeping");
      }, 4000);
    }, 30000);
  };

  useEffect(() => {
    let hasSeen = false;
    try {
      hasSeen = localStorage.getItem(storageKey) === "true";
    } catch {
      hasSeen = false;
    }

    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setAnim("waking");
      }, 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsCompleted(true);
        setAnim("idle");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  useEffect(() => {
    const handleUserActivity = () => {
      resetInactivity();
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
    };
  }, []);

  if (!isMounted) return null;

  const current = steps[currentStep] ?? steps[0];

  const handleNext = () => {
    resetInactivity();
    setBubbleTip(null);
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setAnim(steps[nextStep]?.animation || "excited");
    } else {
      finishTour();
    }
  };

  const handlePrev = () => {
    resetInactivity();
    setBubbleTip(null);
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setAnim(steps[prevStep]?.animation || "curious");
    }
  };

  const finishTour = () => {
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // storage unavailable
    }
    setAnim("celebrate");
    setIsCompleted(true);
    setTimeout(() => {
      setIsOpen(false);
      setAnim("idle");
    }, 1800);
  };

  const skipTour = () => {
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // storage unavailable
    }
    setIsCompleted(true);
    setIsOpen(false);
    setAnim("idle");
  };

  const handleMascotClick = () => {
    resetInactivity();
    const moods = ["playful", "laughing", "excited", "happy"];
    const randomMood = moods[Math.floor(Math.random() * moods.length)] ?? "laughing";
    setAnim(randomMood);

    const randomTip =
      FUN_STUDY_TIPS[Math.floor(Math.random() * FUN_STUDY_TIPS.length)] ?? FUN_STUDY_TIPS[0];
    setBubbleTip(randomTip);

    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <section
      aria-label="Notey study companion and dashboard tour"
      className="relative rounded-none border-2 border-border bg-card p-4 sm:p-6 shadow-hard transition-all"
    >
      {/* Top Bar / Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-3">
        <div className="flex items-center gap-2.5">
          <span className="eyebrow inline-flex items-center gap-1.5 border-2 border-border bg-primary px-2.5 py-0.5 font-bold uppercase tracking-wider text-xs shadow-hard-sm text-primary-foreground">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Study Companion
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Notey · Interactive Guide
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isOpen ? (
            <button
              type="button"
              onClick={skipTour}
              className="inline-flex items-center gap-1.5 border-2 border-border bg-background px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-muted active:translate-x-0.5 active:translate-y-0.5"
              title="Close guide"
            >
              <X className="size-3.5" aria-hidden="true" />
              <span>{isCompleted ? "Close" : "Skip Tour"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setCurrentStep(0);
                setAnim("happy");
                setBubbleTip(null);
              }}
              className="inline-flex items-center gap-1.5 border-2 border-border bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-hard-sm text-primary-foreground transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
              title="Replay website tour"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              <span>Website Tour</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-5">
        {isOpen ? (
          <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
            {/* Mascot Avatar */}
            <div className="flex flex-col items-center justify-center gap-2">
              <NoteyAvatar
                animation={anim}
                size={130}
                onClick={handleMascotClick}
                onAnimationEnd={(endedAnim) => {
                  if (endedAnim === "waking") setAnim("happy");
                }}
              />
              <span className="eyebrow text-[10px] text-muted-foreground uppercase tracking-wider">
                Tap Notey for tips
              </span>
            </div>

            {/* Speech Bubble */}
            <div className="relative rounded-none border-2 border-border bg-background p-4 sm:p-5 shadow-hard-sm space-y-3.5">
              {/* Speech bubble arrow pointer on left for desktop */}
              <div
                className="hidden md:block absolute -left-2.5 top-1/2 -translate-y-1/2 size-4 rotate-45 border-l-2 border-b-2 border-border bg-background"
                aria-hidden="true"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="eyebrow inline-block bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>

                {/* Step indicator dots */}
                <div className="flex items-center gap-1" aria-hidden="true">
                  {steps.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCurrentStep(idx);
                        setAnim(steps[idx]?.animation || "excited");
                        setBubbleTip(null);
                      }}
                      className={`h-2 border border-border transition-all ${
                        idx === currentStep
                          ? "w-6 bg-primary"
                          : idx < currentStep
                            ? "w-2 bg-foreground/60"
                            : "w-2 bg-muted"
                      }`}
                      title={`Go to step ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Title & Speech Content */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide leading-tight">
                  {current.title}
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/90 font-medium">
                  {bubbleTip || current.speech}
                </p>
              </div>

              {/* Pro Tip Box */}
              <div className="flex items-start gap-2 border-2 border-border/40 bg-muted/30 p-2.5 text-xs text-muted-foreground">
                <HelpCircle className="size-4 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                <span>{current.tip}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {current.action ? (
                  <Link
                    href={current.action.href}
                    className="inline-flex items-center gap-1.5 border-2 border-border bg-card px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-muted active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <current.action.icon className="size-3.5" aria-hidden="true" />
                    <span>{current.action.label}</span>
                  </Link>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="inline-flex items-center gap-1 border-2 border-border bg-card px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-muted active:translate-x-0.5 active:translate-y-0.5"
                    >
                      <ArrowLeft className="size-3.5" aria-hidden="true" />
                      <span>Back</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    onMouseEnter={() => setAnim("excited")}
                    onMouseLeave={() => setAnim(current.animation)}
                    className="inline-flex items-center gap-1.5 border-2 border-border bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-hard-sm text-primary-foreground transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
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
        ) : (
          /* Minimized Banner State */
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <NoteyAvatar animation={anim} size={70} onClick={handleMascotClick} />
              <div className="space-y-1">
                <p className="font-display text-base uppercase sm:text-lg leading-tight">
                  Notey is on standby ⚡
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Need a refresher on navigating 7,800+ PYQs, bookmarks, or uploading papers?
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setCurrentStep(0);
                setAnim("happy");
                setBubbleTip(null);
              }}
              className="inline-flex items-center gap-2 border-2 border-border bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-hard-sm text-primary-foreground transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              <span>Explore Platform Guide</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
