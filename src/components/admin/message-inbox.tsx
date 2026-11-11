"use client";

import * as React from "react";
import { Archive, ArchiveRestore, Mail, MailOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showErrorAlert, showSuccessToast } from "@/lib/alerts";

interface PortfolioMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

function isPortfolioMessage(value: unknown): value is PortfolioMessage {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value && typeof value.id === "string" &&
    "name" in value && typeof value.name === "string" &&
    "email" in value && typeof value.email === "string" &&
    "subject" in value && typeof value.subject === "string" &&
    "message" in value && typeof value.message === "string" &&
    "is_read" in value && typeof value.is_read === "boolean" &&
    "is_archived" in value && typeof value.is_archived === "boolean" &&
    "created_at" in value && typeof value.created_at === "string"
  );
}

export function MessageInbox() {
  const [messages, setMessages] = React.useState<PortfolioMessage[]>([]);
  const [showArchived, setShowArchived] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadMessages = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/messages", { cache: "no-store" });
      const data: unknown = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
            ? data.error
            : "Unable to load messages."
        );
      }
      if (
        typeof data !== "object" ||
        data === null ||
        !("messages" in data) ||
        !Array.isArray(data.messages) ||
        !data.messages.every(isPortfolioMessage)
      ) {
        throw new Error("The inbox returned an invalid response.");
      }

      setMessages(data.messages);
    } catch (error) {
      console.error("Unable to load inbox:", error);
      await showErrorAlert(
        "Could not load inbox",
        error instanceof Error ? error.message : "Unable to load messages."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMessages();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadMessages]);

  async function updateMessage(id: string, updates: Partial<Pick<PortfolioMessage, "is_read" | "is_archived">>) {
    try {
      const response = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!response.ok) {
        const data: unknown = await response.json();
        throw new Error(
          typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
            ? data.error
            : "Unable to update message."
        );
      }
      await loadMessages();
      await showSuccessToast(updates.is_archived === undefined ? "Message status updated" : updates.is_archived ? "Message archived" : "Message restored");
    } catch (error) {
      console.error("Unable to update inbox message:", error);
      await showErrorAlert(
        "Could not update message",
        error instanceof Error ? error.message : "Unable to update message."
      );
    }
  }

  const visibleMessages = messages.filter((message) => message.is_archived === showArchived);
  const unreadCount = messages.filter((message) => !message.is_read && !message.is_archived).length;

  return (
    <section className="mx-auto max-w-5xl px-4 pb-24">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contact Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">{unreadCount} unread message{unreadCount === 1 ? "" : "s"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={showArchived ? "outline" : "default"} onClick={() => setShowArchived(false)}>
            Inbox
          </Button>
          <Button type="button" variant={showArchived ? "default" : "outline"} onClick={() => setShowArchived(true)}>
            Archived
          </Button>
          <Button type="button" variant="outline" aria-label="Refresh messages" onClick={() => void loadMessages()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Loading messages...</div>
      ) : visibleMessages.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          {showArchived ? "No archived messages." : "Your inbox is empty. New contact form submissions will appear here."}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleMessages.map((message) => (
            <article key={message.id} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-lg font-bold text-foreground">{message.subject}</h2>
                    {!message.is_read && (
                      <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-500">Unread</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{message.name}</span>
                    {" · "}
                    <a className="text-sky-500 hover:underline" href={`mailto:${message.email}`}>{message.email}</a>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void updateMessage(message.id, { is_read: !message.is_read })}
                  >
                    {message.is_read ? <Mail className="mr-2 h-4 w-4" /> : <MailOpen className="mr-2 h-4 w-4" />}
                    Mark {message.is_read ? "unread" : "read"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void updateMessage(message.id, { is_archived: !message.is_archived })}
                  >
                    {message.is_archived ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
                    {message.is_archived ? "Restore" : "Archive"}
                  </Button>
                </div>
              </div>
              <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{message.message}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
