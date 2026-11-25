"use client";

import * as React from "react";
import { MessageInbox } from "@/components/admin/message-inbox";
import { HomepageContentManager } from "@/components/admin/homepage-content-manager";
import { PortfolioContentManager } from "@/components/admin/portfolio-content-manager";
import { ChatbotFaqManager } from "@/components/admin/chatbot-faq-manager";
import { HobbyManager } from "@/components/admin/hobby-manager";
import { SkillVideoManager } from "@/components/admin/skill-video-manager";
import { Button } from "@/components/ui/button";

type Section = "inbox" | "content" | "homepage" | "chatbot" | "hobbies" | "skill-videos";

export function AdminDashboard() {
  const [section, setSection] = React.useState<Section>("inbox");

  return (
    <>
      <nav aria-label="Admin sections" className="mx-auto mb-8 flex max-w-5xl flex-wrap gap-2 px-4">
        <Button type="button" variant={section === "inbox" ? "default" : "outline"} onClick={() => setSection("inbox")}>
          Contact inbox
        </Button>
        <Button type="button" variant={section === "content" ? "default" : "outline"} onClick={() => setSection("content")}>
          Projects &amp; certificates
        </Button>
        <Button type="button" variant={section === "homepage" ? "default" : "outline"} onClick={() => setSection("homepage")}>
          Homepage &amp; profile
        </Button>
        <Button type="button" variant={section === "chatbot" ? "default" : "outline"} onClick={() => setSection("chatbot")}>
          Chatbot FAQ
        </Button>
        <Button type="button" variant={section === "hobbies" ? "default" : "outline"} onClick={() => setSection("hobbies")}>
          Personal hobbies
        </Button>
        <Button type="button" variant={section === "skill-videos" ? "default" : "outline"} onClick={() => setSection("skill-videos")}>
          Skill videos
        </Button>
      </nav>
      {section === "inbox"
        ? <MessageInbox />
        : section === "content"
          ? <PortfolioContentManager />
          : section === "homepage"
            ? <HomepageContentManager />
            : section === "chatbot"
              ? <ChatbotFaqManager />
              : section === "hobbies"
                ? <HobbyManager />
                : <SkillVideoManager />}
    </>
  );
}
