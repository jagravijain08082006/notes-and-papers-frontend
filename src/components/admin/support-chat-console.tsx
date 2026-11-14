"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Mail,
  MessageSquare,
  RotateCw,
  Search,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type {
  AdminChatDetail,
  AdminChatSummary,
  ChatMessageItem,
} from "@/lib/api/types";
import { fmtDate } from "@/components/admin/ui";
import { bff } from "@/services/api-client";

function fmtChatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return fmtDate(iso);
  } catch {
    return "";
  }
}

export function SupportChatConsole({
  initialChats,
  initialQuery = "",
}: {
  initialChats: AdminChatSummary[];
  initialQuery?: string;
}) {
  const [chats, setChats] = useState<AdminChatSummary[]>(initialChats);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (initialQuery.trim()) {
      const q = initialQuery.toLowerCase().trim();
      const match = initialChats.find(
        (c) =>
          (c.guest_email || "").toLowerCase().includes(q) ||
          (c.guest_name || "").toLowerCase().includes(q),
      );
      if (match) return match.id;
    }
    return initialChats[0]?.id ?? null;
  });

  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessageItem[]>>({});
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const sendingRef = useRef(false);
  const revisionRef = useRef(0);

  const selectedChat = useMemo(
    () => chats.find((c) => c.id === selectedId) ?? null,
    [chats, selectedId],
  );

  const activeMessages = useMemo(
    () => (selectedId ? messagesMap[selectedId] ?? [] : []),
    [messagesMap, selectedId],
  );

  const isLoadingSelected = Boolean(selectedId && !(selectedId in messagesMap));

  const unreadConversationCount = useMemo(
    () => chats.filter((c) => c.unread_by_admin > 0).length,
    [chats],
  );

  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter(
      (c) =>
        (c.guest_name || "").toLowerCase().includes(q) ||
        (c.guest_email || "").toLowerCase().includes(q) ||
        (c.last_message_text || "").toLowerCase().includes(q),
    );
  }, [chats, searchQuery]);

  // Fetch conversation list cleanly (no synchronous setState inside effect paths)
  const fetchChatList = useCallback(async () => {
    const revision = revisionRef.current;
    try {
      const list = await bff<AdminChatSummary[]>("admin/chats?limit=150");
      if (revision === revisionRef.current && !sendingRef.current && Array.isArray(list)) {
        setChats(list);
      }
    } catch {
      // Ignore background poll error
    }
  }, []);

  const handleManualRefresh = async () => {
    if (sendingRef.current) return;
    const revision = revisionRef.current;
    setIsRefreshing(true);
    try {
      const list = await bff<AdminChatSummary[]>("admin/chats?limit=150");
      if (revision === revisionRef.current && !sendingRef.current && Array.isArray(list)) {
        setChats(list);
        toast.success("Conversations refreshed.");
      }
    } catch {
      toast.error("Could not refresh conversations.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const markConversationRead = useCallback((id: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread_by_admin: 0 } : c)),
    );
    bff(`admin/chats/${id}/read`, { method: "POST" })
      .then(() => {
        window.dispatchEvent(new Event("np:admin-chat-updated"));
      })
      .catch(() => {});
  }, []);

  // Load selected conversation thread on selection change WITHOUT silently wiping unread status
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    const revision = revisionRef.current;
    bff<AdminChatDetail>(`admin/chats/${selectedId}?mark_read=false`)
      .then((detail) => {
        if (cancelled || revision !== revisionRef.current || sendingRef.current || !detail) return;
        setMessagesMap((prev) => ({ ...prev, [selectedId]: detail.messages }));
        setChats((prev) =>
          prev.map((c) =>
            c.id === selectedId
              ? {
                  ...c,
                  unread_by_admin: detail.unread_by_admin,
                  last_message_text: detail.last_message_text,
                  last_message_sender: detail.last_message_sender,
                  last_message_at: detail.last_message_at,
                }
              : c,
          ),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setMessagesMap((prev) => ({ ...prev, [selectedId]: prev[selectedId] ?? [] }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // Real-time background polling: refresh chat list (5s) + active thread (4s) WITHOUT auto-marking read
  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    const syncNow = () => {
      if (cancelled || inFlight || sendingRef.current || document.visibilityState !== "visible") return;
      const revision = revisionRef.current;
      inFlight = true;
      void fetchChatList().then(() => {
        window.dispatchEvent(new Event("np:admin-chat-updated"));
      });
      if (selectedId) {
        bff<AdminChatDetail>(`admin/chats/${selectedId}?mark_read=false`)
          .then((detail) => {
            if (cancelled || revision !== revisionRef.current || sendingRef.current || !detail) return;
            setMessagesMap((prev) => ({ ...prev, [selectedId]: detail.messages }));
            setChats((prev) =>
              prev.map((c) =>
                c.id === selectedId
                  ? {
                      ...c,
                      unread_by_admin: detail.unread_by_admin,
                      last_message_text: detail.last_message_text,
                      last_message_sender: detail.last_message_sender,
                      last_message_at: detail.last_message_at,
                    }
                  : c,
              ),
            );
            window.dispatchEvent(new Event("np:admin-chat-updated"));
          })
          .catch(() => {})
          .finally(() => { inFlight = false; });
      } else {
        inFlight = false;
      }
    };

    const listTimer = setInterval(syncNow, 4000);
    window.addEventListener("focus", syncNow);
    document.addEventListener("visibilitychange", syncNow);

    return () => {
      cancelled = true;
      clearInterval(listTimer);
      window.removeEventListener("focus", syncNow);
      document.removeEventListener("visibilitychange", syncNow);
    };
  }, [selectedId, fetchChatList]);

  // Scroll strictly inside inner chat viewport (never scrolls browser window!)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeMessages, selectedId]);

  const handleSelectChat = (chat: AdminChatSummary) => {
    if (sendingRef.current) return;
    setReplyText("");
    setSelectedId(chat.id);
    setShowMobileChat(true);
    if (chat.unread_by_admin > 0) {
      markConversationRead(chat.id);
    }
  };

  const handleSendReply = async () => {
    if (!selectedChat || sendingRef.current) return;
    const text = replyText.trim();
    if (!text || text.length > 2000) return;
    sendingRef.current = true;
    revisionRef.current++;

    const convId = selectedChat.id;
    const optimisticId = `temp-admin-${Date.now()}`;
    const optimisticMsg: ChatMessageItem = {
      id: optimisticId,
      sender: "admin",
      text,
      created_at: new Date().toISOString(),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] ?? []), optimisticMsg],
    }));
    setReplyText("");
    setIsSending(true);

    try {
      const saved = await bff<ChatMessageItem>(`admin/chats/${convId}/messages`, {
        method: "POST",
        body: { text },
      });

      setMessagesMap((prev) => ({
        ...prev,
        [convId]: (prev[convId] ?? []).map((m) => (m.id === optimisticId ? saved : m)),
      }));
      setChats((prev) => {
        const updated = prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                unread_by_admin: 0,
                last_message_text: text,
                last_message_sender: "admin",
                last_message_at: saved.created_at,
              }
            : c,
        );
        return [...updated].sort(
          (a, b) =>
            new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime(),
        );
      });
      window.dispatchEvent(new Event("np:admin-chat-updated"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send message.");
      setMessagesMap((prev) => ({
        ...prev,
        [convId]: (prev[convId] ?? []).filter((m) => m.id !== optimisticId),
      }));
      setReplyText(text);
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  };

  const handleDeleteChat = async (chat: AdminChatSummary) => {
    const label = chat.guest_name || chat.guest_email || "this conversation";
    if (!window.confirm(`Delete chat with ${label}? This removes the entire thread.`)) {
      return;
    }
    try {
      await bff(`admin/chats/${chat.id}`, { method: "DELETE" });
      revisionRef.current++;
      setChats((prev) => {
        const next = prev.filter((c) => c.id !== chat.id);
        if (selectedId === chat.id) {
          setSelectedId(next[0]?.id ?? null);
          setShowMobileChat(false);
        }
        return next;
      });
      window.dispatchEvent(new Event("np:admin-chat-updated"));
      toast.success("Conversation deleted.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete conversation.");
    }
  };

  const handleCopyEmail = (email: string) => {
    if (typeof navigator !== "undefined") {
      void navigator.clipboard.writeText(email);
      toast.success("Email copied!");
    }
  };

  const displayName = selectedChat
    ? selectedChat.guest_name || selectedChat.guest_email?.split("@")[0] || "Guest"
    : "";

  return (
    <div className="flex flex-col w-full border-2 border-border bg-card shadow-hard-lg overflow-hidden">
      {/* Main Two-Pane Clean Chat Layout */}
      <div className="flex flex-col md:flex-row h-[680px] max-h-[82vh] w-full min-w-0">
        {/* ================= LEFT PANE: UNIQUE USERS ================= */}
        <div
          className={`w-full md:w-80 lg:w-96 border-b-2 md:border-b-0 md:border-r-2 border-border bg-background flex flex-col shrink-0 min-w-0 h-full ${
            showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search & Status Header */}
          <div className="p-3 border-b-2 border-border bg-card space-y-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-foreground" />
                <span className="text-xs font-black uppercase tracking-wider text-foreground">
                  Conversations
                </span>
                {unreadConversationCount > 0 && (
                  <span className="inline-flex items-center border border-border bg-destructive px-1.5 py-0.5 text-[10px] font-black uppercase text-destructive-foreground shadow-hard-xs animate-pulse">
                    {unreadConversationCount} New
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => void handleManualRefresh()}
                disabled={isRefreshing}
                className="grid size-7 place-items-center border border-border bg-card hover:bg-muted shadow-hard-xs transition-all cursor-pointer"
                title="Refresh chats"
                aria-label="Refresh chats"
              >
                <RotateCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or message..."
                className="w-full border-2 border-border bg-background py-1.5 pl-8 pr-2.5 text-base sm:text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-hard-xs"
              />
            </div>
          </div>

          {/* Unique Conversations List (1 row per user/guest) */}
          <div className="flex-1 overflow-y-auto divide-y-2 divide-border/30">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider">No conversations yet</p>
                <p className="text-[11px]">
                  Messages sent from the site chat widget appear here automatically.
                </p>
              </div>
            ) : (
              filteredChats.map((c) => {
                const isSelected = selectedId === c.id;
                const isUnread = c.unread_by_admin > 0;
                const name = c.guest_name || c.guest_email?.split("@")[0] || "Guest";
                const previewPrefix = c.last_message_sender === "admin" ? "You: " : "";
                const preview = `${previewPrefix}${c.last_message_text || "No messages"}`;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectChat(c)}
                    disabled={isSending}
                    className={`w-full text-left p-3 transition-colors cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-primary/20 border-l-4 border-l-primary"
                        : isUnread
                          ? "bg-amber-50/60 dark:bg-amber-950/20 hover:bg-muted/50"
                          : "bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`size-9 rounded-full border-2 border-border grid place-items-center text-xs font-black shadow-hard-xs shrink-0 mt-0.5 ${
                        isUnread ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                      }`}
                    >
                      {name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`text-xs uppercase truncate ${
                            isUnread
                              ? "font-black text-foreground"
                              : "font-bold text-foreground/90"
                          }`}
                        >
                          {name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          {fmtChatTime(c.last_message_at)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p
                          className={`text-xs truncate ${
                            isUnread
                              ? "font-bold text-foreground"
                              : "font-medium text-muted-foreground"
                          }`}
                        >
                          {preview}
                        </p>

                        {isUnread && (
                          <span className="min-w-5 h-5 px-1.5 rounded-full border border-border bg-destructive text-destructive-foreground text-[10px] font-black grid place-items-center shrink-0 shadow-hard-xs">
                            {c.unread_by_admin}
                          </span>
                        )}
                      </div>

                      {c.guest_email && (
                        <p className="text-[10px] text-muted-foreground font-mono truncate mt-1">
                          {c.guest_email}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT PANE: ACTIVE 1-ON-1 THREAD ================= */}
        <div
          className={`flex-1 flex flex-col h-full bg-card min-w-0 ${
            showMobileChat ? "flex" : "hidden md:flex"
          }`}
        >
          {selectedChat ? (
            <>
              {/* Clean Contact Header */}
              <div className="border-b-2 border-border bg-muted/30 px-4 py-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1.5 border-2 border-border bg-card hover:bg-muted text-foreground cursor-pointer"
                    title="Back to conversations"
                  >
                    <ArrowLeft className="size-4" />
                  </button>

                  <div className="size-9 rounded-full border-2 border-border bg-primary grid place-items-center text-sm font-black text-primary-foreground shadow-hard-xs shrink-0">
                    <User className="size-4 text-foreground" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground truncate">
                        {displayName}
                      </h3>
                      {selectedChat.unread_by_admin > 0 && (
                        <span className="inline-flex items-center border border-border bg-destructive px-1.5 py-0.5 text-[10px] font-black uppercase text-destructive-foreground shadow-hard-xs animate-pulse">
                          {selectedChat.unread_by_admin} New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-0.5">
                      <span className="truncate max-w-[200px] sm:max-w-none">
                        {selectedChat.guest_email || "Anonymous website visitor"}
                      </span>
                      {selectedChat.guest_email && (
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(selectedChat.guest_email!)}
                          className="hover:text-foreground inline-flex items-center cursor-pointer"
                          title="Copy email"
                        >
                          <Copy className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  {selectedChat.guest_email && (
                    <a
                      href={`mailto:${selectedChat.guest_email}?subject=${encodeURIComponent(
                        "Notes & Papers Support",
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center gap-1 border-2 border-border bg-card px-2.5 text-xs font-bold uppercase tracking-wider shadow-hard-xs hover:bg-muted transition-all"
                      title="Open email app"
                    >
                      <Mail className="size-3.5" />
                      <span className="hidden sm:inline">Email</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleDeleteChat(selectedChat)}
                    className="grid size-8 place-items-center border-2 border-border bg-card text-muted-foreground hover:bg-destructive hover:text-destructive-foreground shadow-hard-xs transition-all cursor-pointer"
                    title="Delete conversation"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Chronological Chat Messages */}
              <div
                ref={chatContainerRef}
                onClick={() => {
                  if (selectedChat.unread_by_admin > 0) {
                    markConversationRead(selectedChat.id);
                  }
                }}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10"
              >
                {isLoadingSelected && activeMessages.length === 0 ? (
                  <div className="h-full grid place-items-center text-xs text-muted-foreground font-mono">
                    Loading conversation...
                  </div>
                ) : activeMessages.length === 0 ? (
                  <div className="h-full grid place-items-center text-xs text-muted-foreground">
                    No messages yet in this conversation.
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isGuest = msg.sender === "guest";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isGuest ? "items-start" : "items-end"}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 px-1">
                          <span>{isGuest ? displayName : "You"}</span>
                          <span>·</span>
                          <span>{fmtChatTime(msg.created_at)}</span>
                        </div>
                        <div
                          className={`max-w-[82%] rounded-sm px-3.5 py-2.5 text-xs sm:text-sm font-medium border-2 border-border shadow-hard-xs ${
                            isGuest
                              ? "bg-card text-foreground"
                              : "bg-primary text-primary-foreground font-semibold"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Clean Reply Composer */}
              <div className="border-t-2 border-border bg-card p-3 sm:p-4 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSendReply();
                  }}
                  className="flex items-end gap-2.5"
                >
                  <textarea
                    rows={2}
                    maxLength={2000}
                    aria-label="Reply to conversation"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onFocus={() => {
                      if (selectedChat.unread_by_admin > 0) {
                        markConversationRead(selectedChat.id);
                      }
                    }}
                    placeholder={`Reply to ${displayName}... (Enter to send, Shift+Enter for new line)`}
                    className="flex-1 min-w-0 border-2 border-border bg-background p-2.5 text-base sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-hard-xs resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (replyText.trim()) void handleSendReply();
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className="inline-flex h-11 shrink-0 items-center gap-1.5 border-2 border-border bg-primary px-4 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-hard hover:shadow-hard-lg active:translate-x-px active:translate-y-px transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="size-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 grid place-items-center p-8 text-center text-muted-foreground space-y-2">
              <MessageSquare className="size-10 mx-auto opacity-30" />
              <p className="text-sm font-black uppercase tracking-wider text-foreground">
                Select a conversation
              </p>
              <p className="text-xs max-w-xs">
                Click any user on the left to view their messages and reply directly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
