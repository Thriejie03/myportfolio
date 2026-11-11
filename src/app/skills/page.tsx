import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SkillsGrid } from "@/components/sections/skills-grid";
import { AIChatbot } from "@/components/chatbot/chatbot";

export default function SkillsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">Technical <span className="text-sky-400">Expertise</span></h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A detailed breakdown of my technical skills and the technologies I use to bring ideas to life.
          </p>
        </div>
        <SkillsGrid />
      </section>

      <Footer />
      <AIChatbot />
    </main>
  );
}
