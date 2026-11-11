"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { certificates } from "@/data/certificates";
import { usePublishedContent } from "@/lib/use-published-content";
import { motion, AnimatePresence } from "framer-motion";
import { AIChatbot } from "@/components/chatbot/chatbot";
import { ExternalLink, Award, X, Maximize2 } from "lucide-react";

export default function CertificatesPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const publishedCertificates = usePublishedContent("/api/content/certificates", certificates);
  const visibleCertificates = publishedCertificates.filter((cert) => cert.showOnCertificatesPage !== false);

  useEffect(() => {
    if (selectedImage && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    } else if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [selectedImage]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const closePreview = () => setSelectedImage(null);

  return (
    <main className="min-h-screen bg-background selection:bg-sky-500/30">
      <Navbar />
      
      <section className="pt-28 sm:pt-32 pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4 sm:mb-6">Certificates & <span className="text-sky-400">Achievements</span></h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              Professional certifications and academic achievements that validate my technical skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {visibleCertificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-2xl p-5 sm:p-6 hover:border-sky-500/50 transition-all group flex flex-col"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-4 sm:mb-6 group-hover:scale-110 transition-transform shrink-0">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 leading-tight">{cert.title}</h3>
                <p className="text-sky-400 text-sm mb-1">{cert.issuer}</p>
                <p className="text-muted-foreground text-xs mb-3 sm:mb-4">{cert.date}</p>
                
                <div className="mb-4 sm:mb-6">
                  <span className="inline-block px-2 py-1 rounded bg-accent/30 text-muted-foreground text-[10px] font-mono">
                    {cert.category}
                  </span>
                </div>

                <button
                  type="button"
                  className="relative w-full aspect-video bg-slate-800 rounded-lg mb-4 sm:mb-6 overflow-hidden border border-white/5 cursor-zoom-in group/img focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:ring-offset-2 focus:ring-offset-background touch-manipulation active:scale-[0.98] transition-transform text-left"
                  onClick={() => setSelectedImage(cert.imageUrl)}
                >
                  <img 
                    src={cert.imageUrl} 
                    alt={cert.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/0f172a/38bdf8?text=Certificate';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-sky-500 p-2 sm:p-3 rounded-full text-white scale-90 group-hover/img:scale-100 transition-transform shadow-lg">
                      <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </button>

                <div className="mt-auto">
                  {cert.link && (
                    <a 
                      href={cert.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-sky-400 hover:text-sky-300 transition-colors touch-manipulation"
                    >
                      View Original <ExternalLink className="ml-2 w-4 h-4 shrink-0" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          {visibleCertificates.length === 0 && (
            <p className="text-center text-muted-foreground">Certificates and achievements will be added here soon.</p>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col"
            onClick={closePreview}
          >
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-end px-3 sm:px-6 py-3 sm:py-6 bg-gradient-to-b from-black/85 via-black/40 to-transparent">
              <button
                onClick={closePreview}
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/10 active:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 touch-manipulation"
                aria-label="Close preview"
              >
                <X className="w-5 h-5 sm:w-7 sm:h-7 sm:group-hover:rotate-90 sm:transition-transform sm:duration-300" />
              </button>
            </div>

            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex-1 flex items-center justify-center w-full min-h-0 px-2 sm:px-6 py-16 sm:py-20"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Certificate Preview"
                className="max-w-full max-h-full w-auto h-auto object-contain shadow-2xl select-none rounded-lg sm:rounded-xl"
                draggable={false}
              />
            </motion.div>

            <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-2 px-3 py-4 sm:py-6 bg-gradient-to-t from-black/85 to-transparent">
              <button
                onClick={closePreview}
                className="text-white/90 text-xs sm:text-sm font-medium px-6 py-2.5 sm:px-8 sm:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 active:bg-white/20 touch-manipulation"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <AIChatbot />
    </main>
  );
}
