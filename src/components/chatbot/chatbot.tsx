"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface AIChatbotProps {
  inline?: boolean;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");
}

function renderInlineMarkdown(text: string, keyPrefix: string): React.ReactNode {
  const decoded = decodeHtmlEntities(text);
  const segments: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s]+)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = regex.exec(decoded)) !== null) {
    if (match.index > last) {
      segments.push(decoded.slice(last, match.index));
    }
    const token = match[0];
    // **bold**
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      segments.push(
        <strong key={`${keyPrefix}-b-${idx}`} className="font-semibold text-foreground">
          {renderInlineMarkdown(token.slice(2, -2), `${keyPrefix}-b-${idx}`)}
        </strong>
      );
    }
    // [label](url) markdown link
    else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const bracketClose = token.indexOf("](");
      const label = token.slice(1, bracketClose);
      const url = token.slice(bracketClose + 2, -1);
      segments.push(
        <a
          key={`${keyPrefix}-l-${idx}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:underline underline-offset-2"
        >
          {label}
        </a>
      );
    }
    // raw URL
    else if (token.startsWith("http://") || token.startsWith("https://")) {
      segments.push(
        <a
          key={`${keyPrefix}-u-${idx}`}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:underline break-all"
        >
          {token}
        </a>
      );
    } else {
      segments.push(token);
    }
    last = match.index + token.length;
    idx++;
  }
  if (last < decoded.length) segments.push(decoded.slice(last));
  return segments;
}

function renderMessageContent(content: string, keyPrefix: string): React.ReactNode {
  return content.split(/(!\[.*?\]\(.*?\))/g).map((part, i) => {
    const imgMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      return (
        <div key={`${keyPrefix}-img-${i}`} className="mt-4 rounded-xl overflow-hidden border border-border shadow-lg">
          <img
            src={imgMatch[2]}
            alt={imgMatch[1]}
            className="w-full h-auto object-cover max-h-[200px]"
          />
        </div>
      );
    }

    return (
      <React.Fragment key={`${keyPrefix}-text-${i}`}>
        {renderInlineMarkdown(part, `${keyPrefix}-seg-${i}`)}
      </React.Fragment>
    );
  });
}

const TypewriterMessage = ({ content }: { content: string }) => {
  const [displayedText, setDisplayedText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        const nextIndex = Math.min(currentIndex + 4, content.length);
        setDisplayedText(content.slice(0, nextIndex));
        setCurrentIndex(nextIndex);
      }, 20);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, content]);

  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent("chat-scroll"));
  }, [displayedText]);

  return (
    <div className="whitespace-pre-wrap">
      {renderMessageContent(displayedText, "typing")}
    </div>
  );
};

export function AIChatbot({ inline = false }: AIChatbotProps) {
  const [isOpen, setIsOpen] = React.useState(inline);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([
    { role: "assistant", content: "Hi! 👋 I'm Thrie Jie's portfolio assistant. Ask me about her projects, skills, certificates, or how to get in touch." }
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };
    
    window.addEventListener("chat-scroll", handleScroll);
    if (scrollRef.current) {
      handleScroll();
    }
    return () => window.removeEventListener("chat-scroll", handleScroll);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const ChatContent = (
    <div className={cn(
      "flex flex-col overflow-hidden h-full",
      !inline && "mb-4 w-[calc(100vw-2rem)] sm:w-[400px] h-[500px] max-h-[calc(100dvh-120px)] bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl"
    )}>
      {/* Header - only if floating */}
      {!inline && (
        <div className="p-4 border-b border-border flex items-center justify-between bg-sky-500/10 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Portfolio Assistant</h3>
              <p className="text-[10px] text-sky-500 font-bold uppercase tracking-widest">Portfolio Guide</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close portfolio assistant"
            className="text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-transparent scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
            <div className={cn(
              "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
              m.role === "user" 
                ? "bg-sky-500 text-white rounded-tr-none" 
                : "bg-muted text-foreground border border-border rounded-tl-none"
            )}>
              {m.role === "assistant" && i === messages.length - 1 ? (
                <TypewriterMessage content={m.content} />
              ) : m.role === "assistant" ? (
                <div className="whitespace-pre-wrap">{renderMessageContent(m.content, `message-${i}`)}</div>
              ) : (
                <div className="whitespace-pre-wrap">{m.content}</div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-2xl rounded-tl-none border border-border">
              <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Keep common visitor questions available throughout the conversation. */}
      {!isLoading && (
         <div className="px-6 pb-4 flex flex-wrap gap-2 max-h-[88px] overflow-y-auto scrollbar-hide shrink-0">
            {[
              "Show me your projects",
              "What skills do you have?",
              "Show certificates",
              "How can I contact you?",
              "Download CV",
              "What training and achievements do you have?",
              "Does Thrie Jie know Canva and UI/UX Design?"
            ].map(s => (
               <button 
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-[10px] bg-muted hover:bg-accent border border-border px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition-all whitespace-nowrap"
               >
                  {s}
               </button>
            ))}
         </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-transparent flex space-x-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Ask the portfolio assistant a question"
          placeholder="Type your question..."
          className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-sky-500/50 transition-colors placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading}
          aria-label="Send question"
          className="bg-sky-500 hover:bg-sky-600 rounded-xl h-11 w-11 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );

  if (inline) return ChatContent;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            {ChatContent}
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="w-14 h-14 rounded-2xl shadow-2xl bg-sky-500 hover:bg-sky-600 transition-transform active:scale-95"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
