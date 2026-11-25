import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SkillsGrid } from "@/components/sections/skills-grid";
import { SkillVideos } from "@/components/sections/skill-videos";
import { AIChatbot } from "@/components/chatbot/chatbot";

export default function SkillsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32">
        <SkillsGrid />
      </section>

      <SkillVideos />

      <Footer />
      <AIChatbot />
    </main>
  );
}
