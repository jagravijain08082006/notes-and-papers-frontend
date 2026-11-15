import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Bookmark, Download, LayoutDashboard, Upload } from "lucide-react";
import { Avatar } from "@/components/profile/avatar";
import { ProfileForm } from "@/components/profile/profile-form";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { getMe } from "@/lib/api/server";

export const metadata: Metadata = { title: "My account", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const me = await getMe();
  if (!me) redirect("/login?next=/account");
  const staff = me.role === "admin" || me.role === "moderator";
  const links = [
    { href: "/bookmarks", label: "Bookmarks", hint: "Papers you saved", icon: Bookmark },
    { href: "/downloads", label: "Downloads", hint: "Saved on this device", icon: Download },
    { href: "/upload", label: "Upload", hint: "Share a paper or notes", icon: Upload },
    ...(staff
      ? [
          {
            href: "/admin",
            label: "Admin",
            hint: "Review queue, sources, analytics",
            icon: LayoutDashboard,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8 sm:space-y-14">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Avatar
            value={me.avatar}
            label="Your avatar"
            className="size-14 shrink-0 shadow-hard-sm sm:size-24 sm:shadow-hard"
          />
          <div className="min-w-0 space-y-2">
            <p className="hidden eyebrow bg-accent px-2 py-0.5 capitalize text-accent-foreground sm:inline-block">
              {me.role}
            </p>
            <h1 className="text-2xl sm:text-5xl lg:text-6xl break-words leading-tight">
              {me.display_name ?? "Student"}
            </h1>
            <p className="break-words text-xs sm:text-sm text-muted-foreground">
              {me.email}
              {me.college ? ` · ${me.college}` : ""}
              {me.city || me.state ? ` · ${[me.city, me.state].filter(Boolean).join(", ")}` : ""}
            </p>
          </div>
        </div>
        <SignOutButton />
      </header>

      <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {links.map(({ href, label, hint, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="brutal brutal-hover group flex h-full items-center gap-2 p-3 sm:gap-4 sm:p-5"
            >
              <span className="grid size-9 shrink-0 place-items-center border border-border bg-primary sm:size-12 sm:border-2">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold sm:text-base sm:uppercase sm:tracking-wide">
                  {label}
                </span>
                <span className="hidden text-sm text-muted-foreground sm:block">{hint}</span>
              </span>
              <ArrowRight
                className="hidden size-4 transition-transform group-hover:translate-x-1 sm:block"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="profile-heading" className="space-y-5 sm:space-y-8">
        <h2 id="profile-heading" className="text-2xl sm:text-5xl">
          Your profile
        </h2>
        <ProfileForm me={me} />
      </section>
    </div>
  );
}
