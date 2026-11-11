"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AIChatbot } from "@/components/chatbot/chatbot";
import { ContactForm } from "@/components/contact/contact-form";
import { Mail, MapPin, Phone, X, Maximize2, ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const MAP_EMBED_SRC = "https://www.google.com/maps?q=Malaybalay%20City%2C%20Bukidnon%2C%208700&output=embed";
const MAP_TITLE = "Malaybalay City, Bukidnon Location Map";

type ContactRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
};

function ContactRow({ icon, label, value, href, external }: ContactRowProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card/50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-500/40 hover:bg-card hover:shadow-lg hover:shadow-sky-500/5 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 transition-all duration-300 group-hover:bg-sky-500 group-hover:text-white group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-sky-500/25">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="truncate font-semibold text-foreground">{value}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky-400 group-hover:opacity-100" />
    </a>
  );
}

function SocialCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-2xl border border-border bg-accent/30 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-500/40 hover:bg-card hover:shadow-lg hover:shadow-sky-500/5 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground transition-all duration-300 group-hover:bg-sky-500/10 group-hover:text-sky-400">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="truncate font-semibold text-foreground">{value}</p>
      </div>
    </a>
  );
}

export default function ContactPage() {
  const [mapModalOpen, setMapModalOpen] = React.useState(false);

  const handleEmailClick = () => {
    window.location.href = "mailto:thriejieb@gmail.com";
  };

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMapModalOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <main className="min-h-screen bg-background selection:bg-sky-500/30">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-widest mb-4">
              <span>Contact</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Let&apos;s <span className="text-sky-400">Connect</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              I&apos;m always open to new opportunities and collaborations. Let&apos;s build something amazing together!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Info Column */}
            <div className="space-y-6">
              {/* Availability banner */}
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4">
                <div className="relative flex h-3 w-3 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  Available for new projects
                </div>
                <span className="ml-auto text-xs text-muted-foreground">Responds within 24 hours</span>
              </div>

              {/* Main contact methods */}
              <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-3">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">Get in Touch</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Direct</span>
                </div>
                <ContactRow icon={<Mail className="h-6 w-6" />} label="Email" value="thriejieb@gmail.com" href="mailto:thriejieb@gmail.com" />
                <ContactRow icon={<Phone className="h-6 w-6" />} label="Phone" value="09268405538" href="tel:+639268405538" />
                <ContactRow icon={<MapPin className="h-6 w-6" />} label="Location" value="Malaybalay City, Bukidnon" href="https://www.google.com/maps?q=Malaybalay%20City%2C%20Bukidnon%2C%208700" external />
              </div>

              {/* Map */}
              <div className="rounded-3xl border border-border bg-card overflow-hidden">
                <div className="h-56 sm:h-64 relative group">
                  <iframe
                    src={MAP_EMBED_SRC}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={MAP_TITLE}
                  />
                  <button
                    type="button"
                    onClick={() => setMapModalOpen(true)}
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:ring-offset-2 focus:ring-offset-background touch-manipulation"
                    aria-label="Expand map to full view"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Maximize2 className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-widest bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
                        Click to Expand
                      </span>
                    </div>
                  </button>
                </div>
                <div className="flex items-center gap-2 px-5 py-3 border-t border-border bg-muted/30">
                  <MapPin className="h-4 w-4 text-sky-400 shrink-0" />
                  <p className="text-xs text-muted-foreground truncate">
                    Malaybalay City, Bukidnon, 8700, Philippines
                  </p>
                </div>
              </div>

              {/* Social links */}
              <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Connect Online</h3>
                <div className="grid grid-cols-1 gap-3">
                  <SocialCard icon={<Mail className="h-5 w-5" />} label="Email" value="thriejieb@gmail.com" href="mailto:thriejieb@gmail.com" />
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div>
              <div className="sticky top-28 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl shadow-black/5">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-400 mb-3">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Inbox
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Send me a Message</h3>
                  <p className="text-sm text-muted-foreground">
                    Your message goes straight to my private portfolio inbox. I&apos;ll get back to you as soon as I can.
                  </p>
                </div>
                <ContactForm />
                <button
                  type="button"
                  onClick={handleEmailClick}
                  className="mt-4 w-full text-center text-sm text-sky-500 hover:text-sky-400 hover:underline transition-colors"
                >
                  Prefer email? Open Gmail instead
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={mapModalOpen} onOpenChange={setMapModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed inset-0 !max-w-6xl !w-11/12 !p-0 !bg-transparent !border-none !rounded-none overflow-hidden !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2 z-[200]"
        >
          <VisuallyHidden>
            <DialogTitle>{MAP_TITLE} Full View</DialogTitle>
            <DialogDescription>Expanded interactive map view of {MAP_TITLE}</DialogDescription>
          </VisuallyHidden>

          {mapModalOpen && (
            <div className="w-full max-h-[90vh] flex flex-col bg-card rounded-3xl overflow-hidden border border-border shadow-2xl">
              <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-border bg-sky-500/5 shrink-0">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-xl font-bold text-foreground truncate">
                      Location Map
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-0.5 truncate">
                      Malaybalay City, Bukidnon
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMapModalOpen(false)}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-accent/50 hover:bg-destructive/10 border border-border hover:border-destructive/30 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all group focus:outline-none focus:ring-2 focus:ring-destructive/30 touch-manipulation shrink-0"
                  aria-label="Close map"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              <div className="w-full h-[400px] sm:h-[550px] md:h-[70vh] bg-muted overflow-hidden flex-1 min-h-0">
                <iframe
                  src={MAP_EMBED_SRC}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${MAP_TITLE} - Expanded View`}
                  className="w-full h-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-8 py-4 sm:py-5 border-t border-border bg-muted/30 shrink-0">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Press <kbd className="px-2 py-0.5 rounded-md bg-accent border border-border text-[10px] sm:text-xs font-mono font-bold text-foreground">Esc</kbd> to close &middot; Click outside to dismiss
                </p>
                <a
                  href="https://www.google.com/maps?q=Malaybalay%20City%2C%20Bukidnon%2C%208700"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-sky-500/15 focus:outline-none focus:ring-2 focus:ring-sky-500/40 touch-manipulation"
                >
                  Open in Google Maps
                  <Maximize2 className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <AIChatbot />
    </main>
  );
}
