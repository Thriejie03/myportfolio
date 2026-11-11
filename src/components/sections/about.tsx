"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Code, Briefcase, Clock, Heart, Terminal, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { skills } from "@/data/skills";
import Link from "next/link";
import type { HomepageContent } from "@/data/homepage";

export function About({ content }: { content: HomepageContent["about"] }) {
  const marqueeSkills = skills.filter(s => 
    ["Frontend", "Backend", "Database", "Tools", "IoT/Hardware", "Deployment"].includes(s.category)
  );

  const statIcons = [
    <Briefcase key="projects" className="w-5 h-5" />,
    <Code key="technologies" className="w-5 h-5" />,
    <Clock key="experience" className="w-5 h-5" />,
    <Heart key="commitment" className="w-5 h-5" />,
  ];

  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-widest">
              <span>About Me</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {content.heading} <br />
              <span className="text-sky-400">{content.accentHeading}</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {content.description}
            </p>

            <Button 
              asChild
              className="bg-accent/50 hover:bg-accent text-foreground border border-border rounded-xl px-8 h-12 transition-all duration-300 group"
            >
              <Link href="/about">
                More About Me 
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {content.stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border flex flex-col items-center text-center space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                  {statIcons[idx]}
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card border border-border rounded-3xl p-8 lg:p-12 shadow-xl overflow-hidden"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground uppercase tracking-wider">Technologies I Use</h3>
            </div>
            <Button variant="outline" className="border-border text-foreground hover:bg-accent rounded-xl" asChild>
              <Link href="/skills">
                See All Technologies <ExternalLink className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <motion.div
              animate={{
                x: [0, "-50%"],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
              className="flex flex-none gap-12 py-4"
            >
              {[...marqueeSkills, ...marqueeSkills].map((skill, idx) => (
                <div
                  key={`${skill.name}-${idx}`}
                  className="flex flex-col items-center space-y-4 group min-w-[120px]"
                >
                  <div className="w-24 h-24 rounded-3xl bg-accent/30 border border-border flex items-center justify-center group-hover:border-sky-500/50 group-hover:bg-sky-500/10 transition-all duration-500 shadow-sm group-hover:shadow-sky-500/10 group-hover:-translate-y-1">
                    <div className="text-sky-400 font-bold text-xs uppercase text-center p-3 leading-tight tracking-tighter">
                      {skill.name}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors text-center">
                    {skill.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
