"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import type { AdminUser, Role } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { bff } from "@/services/api-client";
import { AdminAction } from "./admin-action";

export function UserRoleSelect({
  user,
  isSelf,
  compact = false,
}: {
  user: AdminUser;
  isSelf: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(user.role);

  async function change(next: Role) {
    const prev = role;
    setRole(next);
    try {
      await bff(`admin/users/${user.id}`, { method: "PATCH", body: { role: next } });
      toast.success(`Role updated to ${next}`);
      router.refresh();
    } catch (e) {
      setRole(prev);
      toast.error(e instanceof Error ? e.message : "Could not change the role.");
    }
  }

  if (isSelf) {
    return (
      <Badge tone="accent" className="text-[11px] font-bold uppercase tracking-wider">
        {user.role} (You)
      </Badge>
    );
  }

  return (
    <div className="inline-flex items-center">
      <label className="sr-only" htmlFor={`role-${user.id}`}>
        Role for {user.display_name ?? user.id}
      </label>
      <Select
        id={`role-${user.id}`}
        value={role}
        onChange={(e) => change(e.target.value as Role)}
        className={cn(
          "border-2 border-border bg-card font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:shadow-hard-sm",
          compact ? "h-8 w-28 px-2 text-xs" : "h-9 w-36 px-2.5 text-sm",
        )}
      >
        <option value="user">USER</option>
        <option value="moderator">MODERATOR</option>
        <option value="admin">ADMIN</option>
      </Select>
    </div>
  );
}

export function UserControls({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <UserRoleSelect user={user} isSelf={isSelf} />
      {!isSelf &&
        (user.is_banned ? (
          <AdminAction
            label="Unban"
            path={`admin/users/${user.id}`}
            method="PATCH"
            body={{ is_banned: false }}
          />
        ) : (
          <AdminAction
            label="Ban"
            path={`admin/users/${user.id}`}
            method="PATCH"
            body={{ is_banned: true }}
            confirm="Ban this user? They will be signed out of every API call."
            variant="destructive"
          />
        ))}
    </div>
  );
}
