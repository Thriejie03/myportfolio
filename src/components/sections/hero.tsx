"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Code, Database, Cpu, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { HomepageContent } from "@/data/homepage";

const floatingIcons = [
  { icon: <Code className="w-6 h-6" />, label: "UI/UX Design", top: "10%", right: "10%" },
  { icon: <Database className="w-6 h-6" />, label: "Canva", bottom: "20%", left: "5%" },
  { icon: <Cpu className="w-6 h-6" />, label: "AI Tools", bottom: "30%", right: "5%" },
  { icon: <Globe className="w-6 h-6" />, label: "Documentation", top: "20%", left: "10%" },
];

export function Hero({ content }: { content: HomepageContent["hero"] }) {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-lg sm:text-xl text-foreground mb-2">{content.greeting}</p>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold text-foreground mb-4 leading-tight">
              {content.firstName} <span className="text-sky-400">{content.lastName}</span>
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-muted-foreground mb-6 flex items-center">
              {content.role}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              {content.summary}
            </p>
            
            <div className="flex flex-wrap gap-4 mb-10">
              <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-8 h-14 text-lg font-bold">
                <Link href="/projects">
                  View My Projects
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border hover:bg-accent rounded-xl px-8 h-14 text-lg font-bold text-foreground">
                <Link href="/contact">
                  Let&apos;s Work Together
                </Link>
              </Button>
            </div>

            <div className="flex items-center space-x-6">
              <Link href="mailto:thriejieb@gmail.com" className="text-muted-foreground hover:text-foreground transition-all transform hover:scale-110">
                <Mail className="w-6 h-6" />
              </Link>
            </div>
          </motion.div>

          {/* Right Image/Graphic Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative h-[500px] lg:h-[600px] flex items-center justify-center"
          >
            {/* Main Circle Backdrop */}
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] rounded-full border border-sky-500/10 bg-sky-500/5 animate-pulse" />
               <div className="absolute w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] rounded-full border border-sky-500/5" />
            </div>

            {/* Floating Tech Icons */}
            {floatingIcons.map((item, idx) => (
              <motion.div
                key={idx}
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: idx * 0.5,
                }}
                className="absolute z-20"
                style={{ top: item.top, bottom: item.bottom, left: item.left, right: item.right }}
              >
                <div className="bg-card border border-border p-3 sm:p-4 rounded-2xl flex flex-col items-center space-y-2 shadow-2xl">
                   <div className="text-sky-400">{item.icon}</div>
                   <span className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-wider">{item.label}</span>
                </div>
              </motion.div>
            ))}

            {/* Developer Image */}
            <div className="relative z-10 w-[280px] h-[350px] sm:w-[400px] sm:h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
               <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-20" />
               <Image
                 src={content.imageUrl}
                 alt={`${content.firstName} ${content.lastName}`}
                 fill
                 unoptimized
                 sizes="(max-width: 640px) 280px, 400px"
                 className="object-cover object-top"
               />
            </div>
            
            {/* Floating Code Snippet */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute -bottom-4 right-4 z-30 glass-dark border border-white/10 p-4 rounded-xl shadow-2xl hidden sm:block"
            >
               <pre className="text-[10px] font-mono text-sky-400">
                  <code>{`{
  "status": "ready_to_code",
  "location": "Bukidnon, PH"
}`}</code>
               </pre>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
