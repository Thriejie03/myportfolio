"use client";

import * as React from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showErrorAlert, showSuccessToast } from "@/lib/alerts";

type FaqItem = {
  id: string;
  content: Record<string, unknown>;
  is_published: boolean;
  sort_order: number;
};

function isFaqItem(value: unknown): value is FaqItem {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value && typeof value.id === "string" &&
    "content" in value && typeof value.content === "object" && value.content !== null &&
    "is_published" in value && typeof value.is_published === "boolean" &&
    "sort_order" in value && typeof value.sort_order === "number"
  );
}

function field(content: Record<string, unknown>, key: string, fallback = "") {
  return typeof content[key] === "string" ? content[key] as string : fallback;
}

function textList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join("\n") : "";
}

function splitLines(value: string) {
  return value.split("\n").map((entry) => entry.trim()).filter(Boolean);
}

export function ChatbotFaqManager() {
  const [items, setItems] = React.useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<FaqItem | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  const loadItems = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/content/chatbot-faq", { cache: "no-store" });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to load chatbot FAQ."));
      if (!isRecord(data) || !Array.isArray(data.items) || !data.items.every(isFaqItem)) {
        throw new Error("The chatbot FAQ manager returned an invalid response.");
      }
      setItems(data.items);
    } catch (error) {
      console.error("Unable to load chatbot FAQ:", error);
      await showErrorAlert("Could not load FAQ", error instanceof Error ? error.message : "Unable to load chatbot FAQ.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void loadItems(), 0);
    return () => window.clearTimeout(timer);
  }, [loadItems]);

  async function deleteItem(item: FaqItem) {
    const confirmed = await SwalConfirm(`Delete "${field(item.content, "question", item.id)}"?`);
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/admin/content/chatbot-faq?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to delete FAQ entry."));
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      await showSuccessToast("FAQ entry deleted");
    } catch (error) {
      console.error("Unable to delete chatbot FAQ entry:", error);
      await showErrorAlert("Could not delete entry", error instanceof Error ? error.message : "Unable to delete FAQ entry.");
    }
  }

  async function saveItem(content: Record<string, unknown>, visibility: { is_published: boolean; sort_order: number }) {
    try {
      const response = await fetch("/api/admin/content/chatbot-faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, ...visibility }),
      });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to save FAQ entry."));
      if (!isRecord(data) || !isFaqItem(data.item)) throw new Error("The save response was invalid.");
      const savedItem = data.item;
      setItems((current) => {
        const index = current.findIndex((entry) => entry.id === savedItem.id);
        if (index < 0) return [...current, savedItem].sort((a, b) => a.sort_order - b.sort_order);
        return current.map((entry) => entry.id === savedItem.id ? savedItem : entry).sort((a, b) => a.sort_order - b.sort_order);
      });
      setEditing(null);
      setIsCreating(false);
      await showSuccessToast("FAQ entry saved");
    } catch (error) {
      console.error("Unable to save chatbot FAQ entry:", error);
      await showErrorAlert("Could not save entry", error instanceof Error ? error.message : "Unable to save FAQ entry.");
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 pb-24">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chatbot Knowledge Base</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the question-and-answer entries that power the portfolio chatbot.</p>
        </div>
        <Button type="button" onClick={() => { setEditing(null); setIsCreating(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add FAQ entry
        </Button>
      </div>

      <div className="mb-6 flex gap-2 items-center">
        <Button type="button" variant="outline" onClick={() => void loadItems()} disabled={isLoading} aria-label="Refresh FAQ">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </Button>
        <span className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "entry" : "entries"}</span>
      </div>

      {isLoading ? (
        <p className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Loading FAQ entries…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-foreground">No FAQ entries yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">Add questions and answers to train the chatbot. Visitors will be able to ask these questions.</p>
          <Button type="button" className="mt-5" onClick={() => { setEditing(null); setIsCreating(true); }}>
            Add first FAQ entry
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-foreground">{field(item.content, "question", item.id)}</h2>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{field(item.content, "answer")}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.is_published ? "Published" : "Hidden"}
                    {field(item.content, "category") ? ` · ${field(item.content, "category")}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setEditing(item); setIsCreating(false); }}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="text-destructive" onClick={() => void deleteItem(item)} aria-label={`Delete ${field(item.content, "question", item.id)}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {(editing || isCreating) && (
        <FaqEditor
          key={editing?.id ?? "new"}
          item={editing}
          onCancel={() => { setEditing(null); setIsCreating(false); }}
          onSave={saveItem}
        />
      )}
    </section>
  );
}

function FaqEditor({
  item,
  onCancel,
  onSave,
}: {
  item: FaqItem | null;
  onCancel: () => void;
  onSave: (content: Record<string, unknown>, visibility: { is_published: boolean; sort_order: number }) => Promise<void>;
}) {
  const content = item?.content ?? {};
  const [id, setId] = React.useState(field(content, "id"));
  const [question, setQuestion] = React.useState(field(content, "question"));
  const [answer, setAnswer] = React.useState(field(content, "answer"));
  const [keywords, setKeywords] = React.useState(textList(content.keywords));
  const [category, setCategory] = React.useState(field(content, "category"));
  const [isPublished, setIsPublished] = React.useState(item?.is_published ?? true);
  const [sortOrder, setSortOrder] = React.useState(item?.sort_order ?? 0);
  const [isSaving, setIsSaving] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const normalizedId = (id || question).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const faqContent = {
      id: normalizedId,
      question: question.trim(),
      answer: answer.trim(),
      keywords: splitLines(keywords),
      ...(category.trim() ? { category: category.trim() } : {}),
    };
    try {
      await onSave(faqContent, { is_published: isPublished, sort_order: sortOrder });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[250] overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="faq-editor-title">
      <form onSubmit={submit} className="mx-auto my-6 max-w-2xl space-y-4 rounded-2xl border border-border bg-background p-5 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <h2 id="faq-editor-title" className="text-2xl font-bold text-foreground">{item ? "Edit" : "Add"} FAQ entry</h2>
          <Button type="button" variant="outline" onClick={onCancel}>Close</Button>
        </div>

        <Field label="Question"><input required maxLength={300} value={question} onChange={(event) => setQuestion(event.target.value)} className={inputClass} placeholder="e.g. What are your skills?" /></Field>
        <Field label="Answer"><textarea required maxLength={3000} rows={6} value={answer} onChange={(event) => setAnswer(event.target.value)} className={inputClass} placeholder="The answer the chatbot will give." /></Field>
        <Field label="Keywords (one per line) — helps the chatbot match this question">
          <textarea rows={4} value={keywords} onChange={(event) => setKeywords(event.target.value)} className={inputClass} placeholder="skills&#10;strengths&#10;what can you do" />
        </Field>
        <Field label="Category (optional)"><input maxLength={80} value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass} placeholder="e.g. personal, skills, projects" /></Field>

        {item && <p className="text-xs text-muted-foreground">Entry ID: {item.id}</p>}
        {!item && <Field label="Entry ID (optional; generated from question if empty)"><input maxLength={80} value={id} onChange={(event) => setId(event.target.value)} className={inputClass} /></Field>}

        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} /> Published</label>
          <label className="flex items-center gap-2 text-sm text-foreground">Display order <input type="number" min={0} max={10000} value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className="w-24 rounded-md border border-border bg-card px-2 py-1" /></label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSaving}>{isSaving ? "Saving…" : "Save entry"}</Button>
        </div>
      </form>
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-sky-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5 text-sm font-medium text-foreground"><span>{label}</span>{children}</label>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readError(value: unknown, fallback: string) {
  return isRecord(value) && typeof value.error === "string" ? value.error : fallback;
}

async function SwalConfirm(message: string) {
  const { default: Swal } = await import("sweetalert2");
  const result = await Swal.fire({
    title: "Delete this FAQ entry?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    confirmButtonColor: "#dc2626",
    background: "var(--card)",
    color: "var(--foreground)",
  });
  return result.isConfirmed;
}
