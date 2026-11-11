"use client";

import { ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-xl text-white">
              TJ
            </div>
            <div>
               <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">Thrie Jie <span className="text-sky-400">Barcina</span></h3>
               <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Building systems. Creating solutions. Making impact.</p>
            </div>
          </div>
          
          <div className="text-muted-foreground text-sm font-medium">
            © {new Date().getFullYear()} Thrie Jie B. Barcina. All rights reserved.
          </div>
          
          <button 
            onClick={scrollToTop}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Back to Top</span>
            <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center group-hover:bg-sky-500 transition-all">
               <ArrowUp className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}
