import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SkillsGrid } from "@/components/sections/skills-grid";
import { AIChatbot } from "@/components/chatbot/chatbot";

export default function SkillsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20">
        <header className="mx-auto max-w-7xl px-4 pb-2 pt-10 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">My <span className="text-sky-400">Skills</span></h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Explore the skills and tools Thrie Jie can bring to your team.
          </p>
        </header>
        <SkillsGrid />
      </div>

      <Footer />
      <AIChatbot />
    </main>
  );
}
