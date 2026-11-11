"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showErrorAlert, showSuccessAlert } from "@/lib/alerts";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          website: formData.get("website"),
        }),
      });

      const data: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
            ? data.error
            : "Your message could not be sent. Please try again.";
        throw new Error(message);
      }

      form.reset();
      await showSuccessAlert("Message sent!", "Thanks for reaching out. Your message has been delivered.");
    } catch (error) {
      console.error("Contact form submission failed:", error);
      await showErrorAlert(
        "Message not sent",
        error instanceof Error ? error.message : "Your message could not be sent. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="sr-only" htmlFor="contact-name">Your name</label>
      <input
        id="contact-name"
        name="name"
        autoComplete="name"
        maxLength={100}
        required
        placeholder="Your name"
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
      />

      <label className="sr-only" htmlFor="contact-email">Your email</label>
      <input
        id="contact-email"
        name="email"
        type="email"
        autoComplete="email"
        maxLength={254}
        required
        placeholder="Your email"
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
      />

      <label className="sr-only" htmlFor="contact-subject">Subject</label>
      <input
        id="contact-subject"
        name="subject"
        maxLength={150}
        required
        placeholder="Subject"
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
      />

      <label className="sr-only" htmlFor="contact-message">Your message</label>
      <textarea
        id="contact-message"
        name="message"
        rows={5}
        maxLength={5000}
        required
        placeholder="How can I help?"
        className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
      />

      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full bg-sky-500 text-white hover:bg-sky-600">
        {isSubmitting ? "Sending..." : "Send Message"}
        <Send className="ml-2 h-4 w-4" />
      </Button>

    </form>
  );
}
