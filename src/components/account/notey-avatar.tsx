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
        className="flex items-center justify-center rounded-full bg-primary"
        style={{ width: 60, height: 60 }}
      >
        <div className="flex gap-2">
          <span className="size-2.5 rounded-full bg-foreground" />
          <span className="size-2.5 rounded-full bg-foreground" />
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
  size = 60,
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
        className="flex items-center justify-center rounded-full bg-primary"
        style={{ width: size, height: size }}
      >
        <div className="flex gap-2">
          <span className="size-2.5 rounded-full bg-foreground" />
          <span className="size-2.5 rounded-full bg-foreground" />
        </div>
      </div>
    );
  }

  if (!onClick) {
    return (
      <div
        className={`group relative inline-flex select-none ${className ?? ""}`}
        title="Notey mascot"
        aria-hidden="true"
      >
        <Avatar
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          definition={noteyDefinition as any}
          animation={animation}
          size={size}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onAnimationEnd={onAnimationEnd as any}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex cursor-pointer appearance-none border-0 bg-transparent p-0 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:outline-none ${className ?? ""}`}
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
