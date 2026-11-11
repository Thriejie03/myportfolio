import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { skills } from "@/data/skills";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Project } from "@/types/project";
import type { Certificate } from "@/data/certificates";
import type { HomepageContent } from "@/data/homepage";
import { FAQ, DEVELOPER_DATA } from "@/lib/constants";

export const runtime = "nodejs";

interface FaqEntry {
  question: string;
  answer: string;
  keywords: string[];
  category?: string;
}

interface DynamicData {
  faq: FaqEntry[];
  projects: Project[];
  certificates: Certificate[];
  homepage: HomepageContent | null;
}

function createPublicClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function loadDynamicData(): Promise<DynamicData> {
  const supabase = createPublicClient();
  const empty: DynamicData = { faq: FAQ, projects: [], certificates: [], homepage: null };
  if (!supabase) return empty;

  const [faqRes, projRes, certRes, homeRes] = await Promise.all([
    supabase.from("portfolio_chatbot_faq").select("content").eq("is_published", true).order("sort_order", { ascending: true }),
    supabase.from("portfolio_projects").select("content").eq("is_published", true).order("sort_order", { ascending: true }),
    supabase.from("portfolio_certificates").select("content").eq("is_published", true).order("sort_order", { ascending: true }),
    supabase.from("portfolio_homepage").select("content").eq("id", "main").maybeSingle(),
  ]);

  return {
    faq: (faqRes.data ?? []).map((row: { content: Record<string, unknown> }) => ({
      question: typeof row.content.question === "string" ? row.content.question : "",
      answer: typeof row.content.answer === "string" ? row.content.answer : "",
      keywords: Array.isArray(row.content.keywords) ? (row.content.keywords as unknown[]).filter((k): k is string => typeof k === "string") : [],
      category: typeof row.content.category === "string" ? row.content.category : undefined,
    })).filter((f) => f.question && f.answer),
    projects: (projRes.data ?? []).map((row: { content: Record<string, unknown> }) => row.content as unknown as Project),
    certificates: (certRes.data ?? []).map((row: { content: Record<string, unknown> }) => row.content as unknown as Certificate),
    homepage: homeRes.data ? (homeRes.data.content as unknown as HomepageContent) : null,
  };
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[?.!,]/g, "").trim();
}

function containsAny(msg: string, keywords: string[]): boolean {
  const n = normalize(msg);
  return keywords.some(k => n.includes(normalize(k)));
}

function matchFaq(msg: string, faq: FaqEntry[]): { answer: string } | null {
  const n = normalize(msg);
  const genericKeywords = new Set(["about", "tell me", "who is", "what is", "what are", "how do", "describe", "yourself"]);
  for (const f of faq) {
    const q = normalize(f.question);
    if (n === q || n.includes(q)) return { answer: f.answer };
    const matchedKeywords = f.keywords.filter(k => {
      const keyword = normalize(k);
      return !genericKeywords.has(keyword) && n.includes(keyword);
    });
    if (matchedKeywords.length >= 2) return { answer: f.answer };
  }
  return null;
}

function formatProjectDetail(p: Project): string {
  const links: string[] = [];
  const docsUrl = (p as { documentationUrl?: string }).documentationUrl;
  if (docsUrl) links.push(`[Documentation](${docsUrl})`);
  const techs = Array.isArray(p.technologies) ? p.technologies : [];
  const features = Array.isArray(p.features) ? p.features : [];
  return `**${p.title}** (${p.category})\n\n` +
         `${p.description}\n\n` +
         `**Tech Stack:** ${techs.join(", ") || "—"}\n\n` +
         `**Key Features:**\n${features.map((f, i) => `${i + 1}. ${f}`).join("\n")}` +
         (links.length > 0 ? `\n\n**Links:** ${links.join(" • ")}` : "");
}

const PH_TZ = "Asia/Manila";

function getPHDate(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-PH", {
      timeZone: PH_TZ,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

function getPHTime(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-PH", {
      timeZone: PH_TZ,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date) + " PST (UTC+8)";
  } catch {
    return date.toLocaleTimeString();
  }
}

const PORTFOLIO_ROUTES = [
  { key: "home", path: "/", label: "Home", keywords: ["home", "landing page", "main page", "front page", "go home"] },
  { key: "about", path: "/about", label: "About Me", keywords: ["about", "about me", "about yourself", "tell me about", "go to about", "open about"] },
  { key: "projects", path: "/projects", label: "Projects", keywords: ["project", "projects", "show projects", "open projects", "go to projects", "portfolio work"] },
  { key: "skills", path: "/skills", label: "Technologies / Skills", keywords: ["skill", "skills", "technology", "technologies", "tech stack", "show skills", "open skills", "go to skills"] },
  { key: "certificates", path: "/certificates", label: "Certificates", keywords: ["certificate", "certificates", "certification", "certifications", "award", "awards", "show certificates", "open certificates", "go to certificates"] },
  { key: "contact", path: "/contact", label: "Contact", keywords: ["contact", "contact me", "get in touch", "hire", "show contact", "open contact", "go to contact"] },
];

function findRoute(msg: string) {
  const n = normalize(msg);
  for (const r of PORTFOLIO_ROUTES) {
    const kwMatch = r.keywords.filter(k => n.includes(normalize(k))).length;
    const askNav = containsAny(msg, ["go to", "show me", "open", "take me to", "navigate", "show page", "show the", "where is the"]);
    if (kwMatch > 0 && (askNav || ["about", "projects", "skills", "certificates", "contact"].includes(r.key))) {
      if (kwMatch >= 1 && askNav) return r;
      if (kwMatch >= 2) return r;
    }
  }
  return null;
}

function seedRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function randomFaqIndex(len: number, exclude?: number): number {
  if (len === 0) return 0;
  const rand = seedRandom(Date.now() & 0x7fffffff)();
  let idx = Math.floor(rand * len) % len;
  if (len > 1 && exclude !== undefined && idx === exclude) idx = (idx + 1) % len;
  return idx;
}

function extractTechCandidates(msg: string): string[] {
  const cleaned = msg
    .replace(/\b(do|does|is|are|he|she|know|familiar|with|these|the|a|an|to|and|&|\/|,|;|:|\?|!|\.)\b/gi, " ")
    .replace(/\s+/g, " ");
  return cleaned
    .split(/\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 2);
}

function scoreSkills(candidates: string[]): { known: string[]; missing: string[]; percent: number } {
  const allSkillNames = skills.map(s => s.name.toLowerCase());
  const known: string[] = [];
  const missing: string[] = [];
  for (const raw of candidates) {
    const c = normalize(raw);
    if (!c) continue;
    const hit = allSkillNames.find(s => s === c || s.includes(c) || c.includes(s));
    if (hit) {
      const display = skills.find(x => x.name.toLowerCase() === hit)?.name || hit;
      if (!known.includes(display)) known.push(display);
    } else {
      if (!missing.includes(raw)) missing.push(raw);
    }
  }
  const total = known.length + missing.length;
  const percent = total > 0 ? Math.round((known.length / total) * 100) : 0;
  return { known, missing, percent };
}

type CertCategory = "Programming" | "Web Development" | "Database" | "IoT" | "Blockchain" | "Networking";
const VALID_CERT_CATS: CertCategory[] = ["Programming", "Web Development", "Database", "IoT", "Blockchain", "Networking"];

function categoryFromMessage(msg: string): CertCategory | null {
  if (containsAny(msg, ["programming", "python", "java", "topcit", "language"])) return "Programming";
  if (containsAny(msg, ["web development", "frontend", "web certif", "html", "css"])) return "Web Development";
  if (containsAny(msg, ["database", "db certif", "sql", "mysql", "mongo"])) return "Database";
  if (containsAny(msg, ["iot", "arduino", "hardware", "robot"])) return "IoT";
  if (containsAny(msg, ["blockchain", "sui", "crypto", "web3", "devcon"])) return "Blockchain";
  if (containsAny(msg, ["networking", "network", "ccna", "cisco", "routing", "switch"])) return "Networking";
  return null;
}

function yearFromMessage(msg: string): string | null {
  const match = msg.match(/20\d{2}/);
  return match ? match[0] : null;
}

export async function POST(req: Request) {
  try {
    const data = await loadDynamicData();
    const { messages } = await req.json();
    const rawMessage = messages[messages.length - 1].content as string;
    const msg = rawMessage.toLowerCase();

    const fullName = data.homepage ? `${data.homepage.hero.firstName} ${data.homepage.hero.lastName}`.trim() : DEVELOPER_DATA.fullName;
    const firstName = data.homepage?.hero.firstName || DEVELOPER_DATA.firstName;
    const title = data.homepage?.hero.role || DEVELOPER_DATA.title;
    const summary = data.homepage?.hero.summary || DEVELOPER_DATA.objective;
    const cvUrl = data.homepage?.cv.url || "";
    const cvLabel = data.homepage?.cv.label || "Download CV";
    const aboutDescription = data.homepage?.about.description || "";
    const stats = data.homepage?.about.stats ?? [];

    // 1) FAQ direct match first
    const faqMatch = matchFaq(rawMessage, data.faq);
    if (faqMatch) {
      await new Promise(r => setTimeout(r, 800));
      return NextResponse.json({ content: faqMatch.answer });
    }

    // 2) Date / Time utilities
    const wantDate = containsAny(msg, ["date today", "what is the date", "today's date", "what day is it", "current date", "what date is today", "anong petsa", "petsa ngayon", "date ngayon"]);
    const wantTime = containsAny(msg, ["time today", "what is the time", "current time", "what time is it", "time now", "time right now", "anong oras", "oras ngayon", "time ngayon"]);
    const wantDatetime = wantDate || wantTime;

    let response: string;
    if (wantDatetime) {
      const now = new Date();
      if (wantDate && wantTime) {
        response = `📅 Today is **${getPHDate(now)}**\n\n🕒 Current time: **${getPHTime(now)}**\n\n(Time zone used: Philippine Standard Time — Asia/Manila, UTC+8)`;
      } else if (wantDate) {
        response = `📅 Today is **${getPHDate(now)}**.\n\n(Philippine Standard Time, Asia/Manila)`;
      } else {
        response = `🕒 The current time is **${getPHTime(now)}**.\n\n(Philippine Standard Time, Asia/Manila)`;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json({ content: response });
    }

    // 3) Random Interview Question Generator
    if (containsAny(msg, ["random interview question", "quiz me", "ask me an interview question", "give me an interview question", "random question", "interview question"])) {
      if (data.faq.length === 0) {
        response = "There are no FAQ entries yet. The portfolio owner can add questions and answers in the admin portal.";
      } else {
        const idx = randomFaqIndex(data.faq.length);
        const entry = data.faq[idx];
        response = `🎯 **Interview Question #${idx + 1} of ${data.faq.length}**\n\n**Q:** ${entry.question}\n\n💡 *Tip: Think about your answer first! Then ask me to tell you more about it.*`;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json({ content: response });
    }

    // 4) Skills Match Scoring
    const skillsMatchTrigger = containsAny(msg, [
      "familiar with",
      "does he know",
      "does she know",
      "skills match",
      "skill check"
    ]);
    if (skillsMatchTrigger) {
      const candidates = extractTechCandidates(msg);
      if (candidates.length > 0) {
        const { known, missing, percent } = scoreSkills(candidates);
        const parts: string[] = [];
        parts.push(`🔎 **Skills Match Report** (${candidates.length} candidate${candidates.length > 1 ? "s" : ""})\n`);
        if (known.length > 0) parts.push(`✅ **Known (${known.length}):** ${known.join(", ")}`);
        if (missing.length > 0) parts.push(`❌ **Not explicitly listed (${missing.length}):** ${missing.join(", ")}`);
        parts.push(`\n**Match Score: ${percent}%**`);
        if (known.length > 0) parts.push(`\n*Tip: Ask "What ${known[0]} projects do you have?" to see related work!*`);
        response = parts.join("\n");
        await new Promise(resolve => setTimeout(resolve, 500));
        return NextResponse.json({ content: response });
      }
    }

    // 5) CV / Resume Download
    if (containsAny(msg, ["cv", "resume", "download cv", "download resume", "send resume", "send cv", "show cv", "biodata"])) {
      if (cvUrl) {
        response = `📄 **${cvLabel}**\n\n**👉 [Download / View CV](${cvUrl})**\n\n(Click the link above to open the CV.)`;
      } else {
        response = `📄 A CV is not uploaded yet. The portfolio owner can add it in the admin portal under Homepage & profile.`;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json({ content: response });
    }

    // 6) Portfolio Quick Navigation
    const navAsk = containsAny(msg, ["go to", "show me", "open", "take me to", "navigate to", "show the", "where is the"]);
    const routeMatch = navAsk ? findRoute(msg) : null;
    if (routeMatch) {
      response = `✅ **Navigating to ${routeMatch.label}**\n\n**👉 [Open ${routeMatch.label} Page](${routeMatch.path})**\n\n(Click the link to open the ${routeMatch.key} section.)`;
      await new Promise(resolve => setTimeout(resolve, 300));
      return NextResponse.json({ content: response });
    }

    // 7) Certificates Filter
    if (containsAny(msg, ["certificate", "certification", "certified", "cert", "award"]) &&
        (containsAny(msg, ["show ", "list ", "filter", "in 20", "of 20", "by category", "does he have", "does she have"]) || VALID_CERT_CATS.includes(categoryFromMessage(msg) as CertCategory) || !!yearFromMessage(msg))) {
      const cat = categoryFromMessage(msg);
      const yr = yearFromMessage(msg);
      let list = [...data.certificates];
      if (cat) list = list.filter(c => c.category === cat);
      if (yr) list = list.filter(c => c.date.includes(yr));
      if (list.length === 0) {
        response = `📭 No certificates match the filter. Try broader keywords or ask "what certificates do you have?"`;
      } else {
        const header = `🏆 **Filtered Certificates (${list.length} found)**\n` +
                       (cat ? `• Category: ${cat}\n` : "") +
                       (yr ? `• Year: ${yr}\n` : "");
        const body = list.map(c => {
          const linkPart = c.link ? `\n   View: [Original / PDF](${c.link})` : "";
          return `• **${c.title}** — ${c.issuer} (${c.date}) [${c.category}]${linkPart}`;
        }).join("\n\n");
        response = `${header}\n${body}\n\nBrowse all → **[Certificates Page](/certificates)**`;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json({ content: response });
    }

    // 8) Projects Filter
    const hasTechNames = extractTechCandidates(msg).length > 0 && containsAny(msg, ["project that use", "projects use", "projects with", "uses"]);
    const hasCatNames = containsAny(msg, ["fullstack project", "frontend project", "backend project", "iot project", "desktop project", "game dev project", "full-stack project"]);
    const askProjectsFilter = containsAny(msg, ["which project", "what project", "projects that use", "projects using", "show me projects", "list projects by", "filter projects"]);
    if (askProjectsFilter || hasTechNames || hasCatNames) {
      const techCandidates = extractTechCandidates(msg).filter(w => w.length >= 3);
      const byTech = techCandidates.length > 0
        ? data.projects.filter(p =>
            Array.isArray(p.technologies) && p.technologies.some(t =>
              techCandidates.some(kw => {
                const tl = t.toLowerCase();
                const kwl = kw.toLowerCase();
                return tl === kwl || tl.includes(kwl) || kwl.includes(tl);
              })
            )
          )
        : [];
      let byCat: Project[] = [];
      if (containsAny(msg, ["fullstack", "full stack", "full-stack"])) byCat = data.projects.filter(p => p.category === "Fullstack");
      else if (containsAny(msg, ["iot", "hardware", "arduino"])) byCat = data.projects.filter(p => p.category === "IoT");
      else if (containsAny(msg, ["desktop", "electron"])) byCat = data.projects.filter(p => p.category === "Desktop");
      else if (containsAny(msg, ["frontend", "front-end", "front end"])) byCat = data.projects.filter(p => p.category === "Frontend");
      else if (containsAny(msg, ["backend", "back-end", "back end"])) byCat = data.projects.filter(p => p.category === "Backend");

      const results = byTech.length > 0 ? byTech : byCat;
      if (results.length > 0) {
        const head = `🔍 **Found ${results.length} project${results.length > 1 ? "s" : ""}**\n\n`;
        const body = results.map(p =>
          `• **${p.title}** [${p.category}]\n   Tech: ${(p.technologies ?? []).slice(0, 5).join(", ")}`
        ).join("\n\n");
        response = `${head}${body}\n\nAsk me "Tell me about <project name>" for full details.`;
        await new Promise(resolve => setTimeout(resolve, 500));
        return NextResponse.json({ content: response });
      } else if (askProjectsFilter) {
        response = `🔍 I couldn't narrow projects by that filter. Try asking about a specific technology or category.`;
      }
    }

    // ======== Default fallback help message ========
    response = `I'm ${firstName}'s portfolio assistant. I don't have a specific answer for that yet, but I can help you explore the portfolio. You can ask me about:

• **Projects** — ask about a specific project or filter by technology
• **Skills** — ask about skills and tools
• **Certificates** — ask about certifications and achievements
• **Contact** — ask how to get in touch
• **CV** — ask for the CV download

Try a suggested question below, or ask in your own words.`;

    // =================== PERSONAL / IDENTITY ===================
    if (containsAny(msg, ["who is", "about", "tell me about", "who are you", "introduce yourself"])) {
      const bio = summary || aboutDescription || `${fullName} is a ${title}.`;
      response = `${bio}`;
    }
    else if (containsAny(msg, ["full name", "complete name", "what is your name", "real name"])) {
      response = `The portfolio owner's name is **${fullName}**.`;
    }
    else if (containsAny(msg, ["your title", "job title", "position title", "what is his title", "what is her title", "what do you do", "profession"])) {
      response = `${fullName} is a **${title}**.`;
    }
    else if (containsAny(msg, ["stats", "statistics", "numbers", "how many project", "how many skill", "achievements count"])) {
      if (stats.length > 0) {
        response = `Here are some quick stats:\n\n` + stats.map(s => `• **${s.value}** — ${s.label}`).join("\n");
      } else {
        response = `There are ${data.projects.length} project${data.projects.length === 1 ? "" : "s"} and ${data.certificates.length} certificate${data.certificates.length === 1 ? "" : "s"} in the portfolio.`;
      }
    }

    // =================== AI / TRAINING ===================
    else if (containsAny(msg, ["training", "how do you work", "what are you", "are you ai", "chatbot", "bot", "dataset", "knowledge base"])) {
      response = `I am ${firstName}'s specialized **Portfolio Assistant**, powered by a knowledge base that the portfolio owner manages through the admin portal. I can answer questions about projects, skills, certificates, and contact details based on the content published here. I'm constantly learning from new entries added in the admin portal!`;
    }

    // =================== SKILLS / TECH ===================
    else if (containsAny(msg, ["skill", "tech stack", "technology", "know", "frontend", "backend", "devops", "tools", "what language", "programming", "stack"])) {
      const skillNames = skills.map(s => s.name);
      const parts: string[] = [`**Skills & Tools (${skillNames.length} total):**\n`];
      parts.push(skillNames.join(", "));
      response = parts.join("\n");
    }

    // =================== CERTIFICATES ===================
    else if (containsAny(msg, ["certificate", "certification", "certified", "cert", "achievement", "award", "license", "credential"])) {
      if (data.certificates.length === 0) {
        response = `No certificates have been added yet. The portfolio owner can add them in the admin portal under Projects & certificates.`;
      } else {
        const byCategory: Record<string, string[]> = {};
        data.certificates.forEach(c => {
          const cat = c.category || "Other";
          if (!byCategory[cat]) byCategory[cat] = [];
          byCategory[cat].push(`• ${c.title} (${c.date})`);
        });
        response = `📜 **${data.certificates.length} certificate${data.certificates.length === 1 ? "" : "s"}**:\n\n` +
                   Object.entries(byCategory).map(([cat, list]) => `**${cat}:**\n${list.join("\n")}`).join("\n\n") +
                   `\n\nVisit the Certificates page for the full gallery!`;
      }
    }

    // =================== PROJECTS ===================
    else if (containsAny(msg, ["project", "work on", "built", "portfolio project", "system built"])) {
      if (data.projects.length === 0) {
        response = `No projects have been added yet. The portfolio owner can add them in the admin portal under Projects & certificates.`;
      } else {
        // Check for a specific project by name
        const specific = data.projects.find(p => {
          const title = p.title.toLowerCase();
          return normalize(msg).split(/\s+/).some(w => w.length >= 3 && title.includes(w));
        });
        if (specific) {
          response = formatProjectDetail(specific);
        } else {
          response = `🚀 **${data.projects.length} project${data.projects.length === 1 ? "" : "s"}**:\n\n` +
                     data.projects.map((p, i) => {
                       return `${i + 1}. **${p.title}** [${p.category}]\n   ${(p.description ?? "").substring(0, 100)}${(p.description ?? "").length > 100 ? "..." : ""}\n   Tech: ${(p.technologies ?? []).slice(0, 4).join(", ")}`;
                     }).join("\n\n") +
                     `\n\nAsk me about a specific project for full details.`;
        }
      }
    }

    // =================== CONTACT ===================
    else if (containsAny(msg, ["contact", "hire", "email", "reach", "get in touch", "contact info", "how to reach", "phone", "number", "call", "text"])) {
      response = `📬 **Get in touch with ${fullName}:**\n\n` +
                 `• Email: [${DEVELOPER_DATA.email}](mailto:${DEVELOPER_DATA.email})\n` +
                 `• Phone: [${DEVELOPER_DATA.phone}](tel:+63${DEVELOPER_DATA.phone.slice(1)})\n` +
                 `• Location: ${DEVELOPER_DATA.location}\n` +
                 `• Or use the contact form on the **[Contact page](/contact)** of this site.`;
    }

    await new Promise(resolve => setTimeout(resolve, 800));
    return NextResponse.json({ content: response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
