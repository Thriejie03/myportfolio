"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X, Download, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useVisitCount } from "@/components/analytics/visit-counter";
import { useHomepageContent } from "@/lib/use-homepage-content";
import { defaultHomepageContent } from "@/data/homepage";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Technologies", href: "/skills" },
  { name: "Certificates", href: "/certificates" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { count, unavailable } = useVisitCount();
  const homepage = useHomepageContent();
  const cv = homepage?.cv ?? defaultHomepageContent.cv;
  const [mounted, setMounted] = React.useState(false);
  const formattedCount = count === null ? "—" : new Intl.NumberFormat().format(count);

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-xl text-white">
                TJ
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground uppercase hidden sm:block">
                Thrie Jie <span className="text-sky-400">Barcina</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden lg:block">
            <div className="flex items-baseline space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all relative group",
                    pathname === item.href
                      ? "text-sky-400"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.name}
                  {pathname === item.href && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-sky-500"
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div
              aria-live="polite"
              aria-label={unavailable ? "Visit count unavailable" : `Portfolio visits: ${formattedCount}`}
              title={unavailable ? "Visit count unavailable" : "Total portfolio page visits"}
              className="flex items-center gap-2 rounded-xl border border-border/50 bg-accent/50 px-3 py-2 text-xs font-medium text-muted-foreground"
            >
              <span>Visits</span>
              <span className="font-bold tabular-nums text-foreground">{formattedCount}</span>
            </div>

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-xl bg-accent/50 text-foreground hover:bg-accent transition-colors border border-border/50"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            <div className="hidden lg:block">
              <a 
                href={cv.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6">
                  <Download className="mr-2 w-4 h-4" />
                  {cv.label}
                </Button>
              </a>
            </div>

            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden bg-background border-b border-border/40"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                  pathname === item.href
                    ? "text-sky-400 bg-sky-400/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-2">
               <a 
                 href={cv.url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block w-full"
               >
                 <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                    <Download className="mr-2 w-4 h-4" />
                    {cv.label}
                 </Button>
               </a>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
