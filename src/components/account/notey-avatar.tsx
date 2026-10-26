"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import noteyDefinition from "@/data/notey.avatar.json";
import "@bible-strong/avatar-react/styles.css";

const Avatar = dynamic(
  () => import("@bible-strong/avatar-react").then((m) => m.Avatar),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center rounded-full border-2 border-border bg-primary font-bold shadow-hard-sm"
        style={{ width: 120, height: 120 }}
      >
        <div className="flex gap-2">
          <span className="size-3 rounded-full bg-foreground animate-bounce" />
          <span className="size-3 rounded-full bg-foreground animate-bounce [animation-delay:150ms]" />
        </div>
      </div>
    ),
  }
);

interface NoteyAvatarProps {
  animation?: string;
  size?: number;
  className?: string;
  onAnimationEnd?: (anim: string) => void;
  onClick?: () => void;
}

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function NoteyAvatar({
  animation = "idle",
  size = 120,
  className,
  onAnimationEnd,
  onClick,
}: NoteyAvatarProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!isMounted) {
    return (
      <div
        className="flex items-center justify-center rounded-full border-2 border-border bg-primary shadow-hard-sm"
        style={{ width: size, height: size }}
      >
        <div className="flex gap-2">
          <span className="size-3 rounded-full bg-foreground" />
          <span className="size-3 rounded-full bg-foreground" />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex cursor-pointer appearance-none border-0 bg-transparent p-0 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className ?? ""}`}
      title="Click Notey for a reaction!"
      aria-label="Notey mascot"
    >
      <Avatar
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        definition={noteyDefinition as any}
        animation={animation}
        size={size}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onAnimationEnd={onAnimationEnd as any}
      />
    </button>
  );
}
