"use client";

import { skills } from "@/data/skills";
import { motion } from "framer-motion";

const categories = ["Frontend", "Backend", "Database", "Tools", "IoT/Hardware", "Deployment"];

export function SkillsGrid() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Technical <span className="text-sky-400">Stack</span></h2>
          <p className="text-muted-foreground">My toolbox for building high-quality software solutions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {categories.map((category, catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.1 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-foreground border-l-4 border-sky-500 pl-4">
                {category}
              </h3>
              <div className="flex flex-wrap gap-3">
                {skills
                  .filter((skill) => skill.category === category)
                  .map((skill, skillIndex) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: (catIndex * 0.1) + (skillIndex * 0.05) }}
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 rounded-lg bg-accent/30 border border-border hover:bg-sky-500/10 hover:border-sky-500/30 transition-all cursor-default text-muted-foreground hover:text-foreground text-sm font-medium"
                    >
                      {skill.name}
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
