"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Play } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

interface ProjectGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  projectTitle: string;
}

export function ProjectGallery({ isOpen, onClose, images, projectTitle }: ProjectGalleryProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isZoomed, setIsZoomed] = React.useState(false);

  const touchStartX = React.useRef<number | null>(null);
  const touchEndX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);
  const touchEndY = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (isOpen && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    } else if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen]);

  const handleNext = React.useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  }, [images.length]);

  const handlePrev = React.useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  }, [images.length]);

  const handleThumbnailClick = (idx: number) => {
    setCurrentIndex(idx);
    setIsZoomed(false);
  };

  const toggleZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  const isVideo = (url: string) => url.toLowerCase().endsWith('.mp4');

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    touchEndY.current = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null || touchStartY.current === null || touchEndY.current === null) return;
    const dx = touchEndX.current - touchStartX.current;
    const dy = touchEndY.current - touchStartY.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const threshold = 50;

    if (absDx > absDy && absDx > threshold) {
      if (dx < 0) handleNext();
      else handlePrev();
    } else if (absDy > absDx && absDy > threshold && absDx < 30) {
      if (dy < 0) onClose();
    }

    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleNext, handlePrev, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        showCloseButton={false}
        className="fixed inset-0 !max-w-none !w-screen !h-screen !p-0 !bg-black/98 !border-none overflow-hidden flex flex-col z-[200] !rounded-none !translate-x-0 !translate-y-0 !top-0 !left-0 duration-300 touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <VisuallyHidden>
            <DialogTitle>{projectTitle} Full Screen View</DialogTitle>
            <DialogDescription>Full screen gallery for {projectTitle}</DialogDescription>
        </VisuallyHidden>
        
        {/* Top Controls */}
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-[210] flex items-center space-x-2 sm:space-x-4">
          {!isVideo(images[currentIndex]) && (
            <button 
              onClick={toggleZoom} 
              className="min-w-12 min-h-12 sm:min-w-0 sm:min-h-0 p-2.5 sm:p-4 rounded-full bg-black/40 sm:bg-white/5 hover:bg-white/20 text-white backdrop-blur-xl transition-all border border-white/10 sm:border-white/20 shadow-2xl touch-manipulation"
              title={isZoomed ? "Zoom Out" : "Zoom In"}
            >
              {isZoomed ? (
                <ZoomOut className="w-5 h-5 sm:w-8 sm:h-8" />
              ) : (
                <ZoomIn className="w-5 h-5 sm:w-8 sm:h-8" />
              )}
            </button>
          )}
          
          <button 
            onClick={onClose} 
            className="min-w-12 min-h-12 sm:min-w-0 sm:min-h-0 p-2.5 sm:p-4 rounded-full bg-black/40 sm:bg-white/5 hover:bg-white/20 text-white backdrop-blur-xl transition-all border border-white/10 sm:border-white/20 group shadow-2xl touch-manipulation"
          >
            <X className="w-5 h-5 sm:w-8 sm:h-8 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Main View */}
        <div 
          className={cn(
            "relative flex-1 transition-all duration-300 flex justify-center",
            isZoomed ? "overflow-y-auto overflow-x-hidden items-start" : "overflow-hidden items-center p-2 sm:p-12 mt-12 sm:mt-16 mb-24 sm:mb-32"
          )}
          onClick={() => isZoomed && setIsZoomed(false)}
        >
          <AnimatePresence>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={cn(
                "relative flex justify-center transition-all duration-300",
                isZoomed ? "w-full py-20 sm:py-24 min-h-screen" : "w-full h-full items-center"
              )}
            >
              {isVideo(images[currentIndex]) ? (
                <video
                  src={images[currentIndex]}
                  controls
                  autoPlay
                  className="max-w-full max-h-full w-auto h-auto rounded-lg shadow-2xl"
                />
              ) : (
                <img
                  src={images[currentIndex]}
                  alt={`${projectTitle} screenshot ${currentIndex + 1}`}
                  onClick={!isZoomed ? toggleZoom : undefined}
                  className={cn(
                    "drop-shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300",
                    isZoomed 
                      ? "max-w-[100%] sm:max-w-[85%] h-auto cursor-zoom-out" 
                      : "max-w-full max-h-full w-auto h-auto object-contain cursor-zoom-in"
                  )}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Large Navigation Controls - Only show when not zoomed */}
          {!isZoomed && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-1 sm:left-6 min-w-12 min-h-12 sm:min-w-0 sm:min-h-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/20 sm:bg-white/5 border border-white/5 sm:border-white/10 flex items-center justify-center text-white hover:bg-sky-500 hover:scale-110 transition-all backdrop-blur-sm group z-[220] touch-manipulation"
              >
                <ChevronLeft className="w-6 h-6 sm:w-10 sm:h-10 group-active:-translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={handleNext}
                className="absolute right-1 sm:right-6 min-w-12 min-h-12 sm:min-w-0 sm:min-h-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/20 sm:bg-white/5 border border-white/5 sm:border-white/10 flex items-center justify-center text-white hover:bg-sky-500 hover:scale-110 transition-all backdrop-blur-sm group z-[220] touch-manipulation"
              >
                <ChevronRight className="w-6 h-6 sm:w-10 sm:h-10 group-active:translate-x-1 transition-transform" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Info & Thumbnails */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
               <h3 className="text-white/60 text-[10px] sm:text-sm font-bold uppercase tracking-[0.2em] line-clamp-1">{projectTitle}</h3>
               <div className="h-1 w-1 rounded-full bg-white/20" />
               <span className="text-sky-400 font-mono text-[10px] sm:text-sm">{currentIndex + 1} / {images.length}</span>
            </div>
            
            <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2 scrollbar-hide max-w-full px-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => handleThumbnailClick(idx)}
                  className={`relative flex-shrink-0 w-16 h-12 sm:w-24 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 touch-manipulation ${
                    idx === currentIndex 
                      ? "border-sky-500 scale-110 shadow-[0_0_20px_rgba(14,165,233,0.3)]" 
                      : "border-white/10 opacity-40 hover:opacity-100 hover:border-white/30"
                  }`}
                >
                  {isVideo(img) ? (
                    <div className="w-full h-full bg-accent/20 flex items-center justify-center">
                      <Play className="w-4 h-4 sm:w-6 sm:h-6 text-sky-400 fill-sky-400" />
                    </div>
                  ) : (
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
