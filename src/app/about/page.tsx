"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AIChatbot } from "@/components/chatbot/chatbot";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Briefcase, Clock, Heart, Terminal, ExternalLink, Sparkles, ChevronRight, X, ChevronLeft, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { skills } from "@/data/skills";
import Link from "next/link";

type HobbyImage = {
  src: string;
  alt: string;
};

const PickleBallIcon = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <radialGradient id="pb-ball" cx="38%" cy="32%" r="72%">
        <stop offset="0%" stopColor="#d7ff45" />
        <stop offset="55%" stopColor="#a8ee0c" />
        <stop offset="100%" stopColor="#67b800" />
      </radialGradient>
      <radialGradient id="pb-highlight" cx="35%" cy="28%" r="30%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="94" fill="url(#pb-ball)" stroke="#4e9400" strokeWidth="2.5" />
    <circle cx="100" cy="100" r="94" fill="url(#pb-highlight)" />
    <circle cx="115" cy="55" r="10.5" fill="#7fc600" stroke="#59a300" strokeWidth="1.5" opacity="0.85" />
    <circle cx="115" cy="55" r="10.5" fill="#ffffff" opacity="0.45" />
    <circle cx="60" cy="78" r="12" fill="#7fc600" stroke="#59a300" strokeWidth="1.5" opacity="0.9" />
    <circle cx="60" cy="78" r="12" fill="#ffffff" opacity="0.35" />
    <circle cx="72" cy="112" r="16" fill="#8dd600" stroke="#5aa800" strokeWidth="1.5" />
    <circle cx="72" cy="112" r="16" fill="#ffffff" opacity="0.25" />
    <circle cx="128" cy="114" r="16.5" fill="#8dd600" stroke="#5aa800" strokeWidth="1.5" />
    <circle cx="128" cy="114" r="16.5" fill="#ffffff" opacity="0.25" />
    <circle cx="165" cy="98" r="11" fill="#7fc600" stroke="#59a300" strokeWidth="1.5" opacity="0.9" />
    <circle cx="165" cy="98" r="11" fill="#ffffff" opacity="0.35" />
    <ellipse cx="62" cy="150" rx="14" ry="8" fill="#85cb00" stroke="#559e00" strokeWidth="1.5" transform="rotate(-18 62 150)" opacity="0.9" />
    <ellipse cx="132" cy="164" rx="16" ry="8" fill="#85cb00" stroke="#559e00" strokeWidth="1.5" transform="rotate(12 132 164)" opacity="0.9" />
    <ellipse cx="88" cy="182" rx="18" ry="6" fill="#80c300" stroke="#529900" strokeWidth="1.5" opacity="0.9" />
    <ellipse cx="148" cy="42" rx="16" ry="7" fill="#85cb00" stroke="#559e00" strokeWidth="1.5" transform="rotate(20 148 42)" opacity="0.85" />
  </svg>
);

type Hobby = {
  title: string;
  icon: React.ReactNode;
  iconLabel: string;
  description: string;
  images: HobbyImage[];
  accent: string;
};

const hobbies: Hobby[] = [
  {
    title: "Pickle Ball",
    icon: <PickleBallIcon />,
    iconLabel: "🏓",
    description: "Staying active and competitive on the court with fast-paced rallies",
    accent: "from-yellow-500/20 to-emerald-500/20",
    images: [
      { src: "/pickle1.jpg", alt: "Pickle Ball game action" },
      { src: "/pickle2.jpg", alt: "Pickle Ball court" },
      { src: "/pickle3.jpg", alt: "Pickle Ball match" },
    ],
  },
  {
    title: "Billiards",
    icon: "🎱",
    iconLabel: "🎱",
    description: "Focusing the mind with strategic shots and precise positioning",
    accent: "from-sky-500/20 to-indigo-500/20",
    images: [
      { src: "/billiard1.jpg", alt: "Billiards table shot" },
    ],
  },
  {
    title: "Coffee Sessions",
    icon: "☕",
    iconLabel: "☕",
    description: "Fueling creativity one cup at a time in cozy cafés",
    accent: "from-amber-500/20 to-orange-500/20",
    images: [
      { src: "/coffee1.jpg", alt: "Coffee cup" },
    ],
  },
  {
    title: "Hiking",
    icon: "🥾",
    iconLabel: "🥾",
    description: "Exploring nature trails and reaching breathtaking mountain summits",
    accent: "from-emerald-500/20 to-teal-500/20",
    images: [
      { src: "/hiking1.jpg", alt: "Mountain trail" },
      { src: "/hiking2.jpg", alt: "Hiking summit view" },
    ],
  },
  {
    title: "Travel",
    icon: "✈️",
    iconLabel: "✈️",
    description: "Discovering new places, cultures, and unforgettable experiences",
    accent: "from-sky-500/20 to-cyan-500/20",
    images: [
      { src: "/travel1.jpg", alt: "Travel destination" },
      { src: "/travel2.jpg", alt: "Scenic travel spot" },
      { src: "/travel3.jpg", alt: "Travel adventure" },
    ],
  },
];

export default function AboutPage() {
  const marqueeSkills = skills.filter(s =>
    ["Frontend", "Backend", "Database", "Tools", "IoT/Hardware", "Deployment"].includes(s.category)
  );

  const stats = [
    { icon: <Briefcase className="w-5 h-5" />, value: "4th", label: "Year BSIT Student" },
    { icon: <Code className="w-5 h-5" />, value: `${skills.length}+`, label: "Technologies" },
    { icon: <Clock className="w-5 h-5" />, value: "5", label: "Achievements" },
    { icon: <Heart className="w-5 h-5" />, value: "100%", label: "Commitment" },
  ];

  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxImages, setLightboxImages] = React.useState<HobbyImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);
  const [activeHobbyTitle, setActiveHobbyTitle] = React.useState("");
  const [activeHobbyIcon, setActiveHobbyIcon] = React.useState<React.ReactNode>("✨");

  const touchStartX = React.useRef<number | null>(null);
  const touchEndX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);
  const touchEndY = React.useRef<number | null>(null);

  const openLightbox = (hobby: Hobby, startIndex: number = 0) => {
    setLightboxImages(hobby.images);
    setLightboxIndex(startIndex);
    setActiveHobbyTitle(hobby.title);
    setActiveHobbyIcon(hobby.icon);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImages([]);
    setLightboxIndex(0);
    setActiveHobbyTitle("");
    setActiveHobbyIcon("✨");
  };

  const totalImages = lightboxImages.length;

  const nextImage = () => {
    if (totalImages > 0) {
      setLightboxIndex((i) => (i + 1) % totalImages);
    }
  };

  const prevImage = () => {
    if (totalImages > 0) {
      setLightboxIndex((i) => (i - 1 + totalImages) % totalImages);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    touchEndY.current = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null || touchStartY.current === null || touchEndY.current === null) return;
    const dx = touchEndX.current - touchStartX.current;
    const dy = touchEndY.current - touchStartY.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const threshold = 50;

    if (absDx > absDy && absDx > threshold) {
      if (dx < 0) nextImage();
      else prevImage();
    } else if (absDy > absDx && absDy > threshold && absDx < 30) {
      if (dy < 0) closeLightbox();
    }

    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = lightboxOpen ? "hidden" : "";
    }

    const handleKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (typeof document !== "undefined") document.body.style.overflow = "";
    };
  }, [lightboxOpen, nextImage, prevImage]);

  return (
    <main className="min-h-screen bg-background selection:bg-sky-500/30">
      <Navbar />

      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16 lg:mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-5 sm:space-y-6"
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-widest">
                <span>About Me</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Turning Ideas Into <br className="hidden sm:block" />
                <span className="text-sky-400">Real-World Solutions</span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                I&apos;m a 4th-year BS Information Technology student at Bukidnon State University seeking an OJT internship.
                I combine communication, documentation, design, and technology skills to deliver quality work while continuing to learn.
              </p>

              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-6 sm:px-8 h-11 sm:h-12 transition-all duration-300 text-sm sm:text-base">
                  <Link href="/projects">
                    View My Projects
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-border hover:bg-accent text-foreground rounded-xl px-6 sm:px-8 h-11 sm:h-12 transition-all duration-300 text-sm sm:text-base">
                  <Link href="/contact">
                    Get In Touch
                  </Link>
                </Button>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border flex flex-col items-center text-center space-y-2 sm:space-y-3 hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                    {stat.icon}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-bold leading-tight">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-10 gap-4 sm:gap-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
                  <Terminal className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-foreground uppercase tracking-wider">Technologies I Use</h3>
              </div>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent rounded-xl text-sm" asChild>
                <Link href="/skills">
                  See All Technologies <ExternalLink className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] -mx-5 sm:-mx-0">
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
                className="flex flex-none gap-8 sm:gap-12 py-4"
              >
                {[...marqueeSkills, ...marqueeSkills].map((skill, idx) => (
                  <div
                    key={`${skill.name}-${idx}`}
                    className="flex flex-col items-center space-y-2 sm:space-y-4 group min-w-[90px] sm:min-w-[120px]"
                  >
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-accent/30 border border-border flex items-center justify-center group-hover:border-sky-500/50 group-hover:bg-sky-500/10 transition-all duration-500 shadow-sm group-hover:shadow-sky-500/10 group-hover:-translate-y-1">
                      <div className="text-sky-400 font-bold text-[10px] sm:text-xs uppercase text-center p-2 sm:p-3 leading-tight tracking-tighter">
                        {skill.name}
                      </div>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors text-center">
                      {skill.name}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gradient-to-b from-background via-accent/10 to-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 sm:mb-16"
          >
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span>Get to Know Me Better</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-4">
                Beyond <span className="text-sky-400 bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">the Code</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mx-auto px-2">
                Certifications, core values, and the personal interests that shape who I am as a developer and individual.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-sky-500/5 via-sky-500/[0.02] to-transparent border border-sky-500/10 hover:border-sky-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/5"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-500/5 flex items-center justify-center text-sky-400 shadow-inner border border-sky-500/10 shrink-0">
                  <span className="text-xl sm:text-2xl">📜</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Certifications &amp; Background</h4>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                <p className="text-muted-foreground leading-[1.75] text-sm sm:text-base">
                  My achievements include Academic Achiever, TopCIT Level 2, Networking CCNA 1–2,
                  Dean&apos;s Lister from 1st to 4th year, and With High Honors. I am currently
                  completing my Bachelor of Science in Information Technology at Bukidnon State University.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-emerald-500/[0.02] to-transparent border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center text-emerald-400 shadow-inner border border-emerald-500/10 shrink-0">
                  <span className="text-xl sm:text-2xl">💭</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">My Philosophy</h4>
              </div>
              <blockquote className="relative pl-5 border-l-2 border-emerald-500/30">
                <p className="text-muted-foreground leading-[1.75] italic text-[14px] sm:text-[15px]">
                  &ldquo;I have an insatiable curiosity for technology because it knows no limits. It is a field that is constantly evolving every day, and I am driven by the challenge of staying at the forefront of that evolution.&rdquo;
                </p>
              </blockquote>
            </motion.div>
          </div>

          <div className="space-y-5 sm:space-y-7">
            <div className="flex items-center justify-between gap-2 sm:gap-4 pb-2 border-b border-border/40">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10 shadow-inner shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Personal Hobbies</h4>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-semibold mt-0.5 leading-tight">
                    Tap to enlarge &middot; Swipe left/right
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-7">
              {hobbies.map((hobby, hobbyIdx) => (
                <motion.div
                  key={hobby.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: hobbyIdx * 0.06, duration: 0.5, ease: "easeOut" }}
                  className={`rounded-2xl border border-border/60 bg-gradient-to-br ${hobby.accent} p-5 sm:p-6 sm:p-7 hover:shadow-xl hover:shadow-black/5 transition-all duration-500 hover:-translate-y-1 group/card`}
                >
                  <div className="flex items-start gap-4 sm:gap-5 mb-5 sm:mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-background/80 border border-border/60 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-sm group-hover/card:scale-110 transition-transform duration-300">
                      {hobby.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">{hobby.title}</h5>
                      <p className="text-muted-foreground text-sm mt-2 leading-[1.7]">{hobby.description}</p>
                      <div className="inline-flex items-center gap-2 mt-3 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/10">
                        <span className="text-[11px] text-sky-400 font-bold uppercase tracking-wider">
                          {hobby.images.length} photo{hobby.images.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`grid gap-2 sm:gap-3 ${
                    hobby.images.length === 1 ? "grid-cols-1" :
                    hobby.images.length === 2 ? "grid-cols-2" :
                    "grid-cols-2 sm:grid-cols-3"
                  }`}>
                    {hobby.images.map((img, imgIdx) => (
                      <button
                        key={`${hobby.title}-${imgIdx}`}
                        onClick={() => openLightbox(hobby, imgIdx)}
                        className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-border/40 bg-accent/20 aspect-[4/3] cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:ring-offset-2 focus:ring-offset-background transition-all hover:border-sky-500/30 active:scale-[0.98] touch-manipulation min-h-[90px] sm:min-h-0"
                      >
                        <img
                          src={img.src}
                          alt={img.alt}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 ring-1 ring-white/20 shadow-xl">
                            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" />
                          </div>
                        </div>
                        {hobby.images.length > 1 && imgIdx === 0 && (
                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow-lg ring-1 ring-white/10">
                            +{hobby.images.length - 1} more
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative mt-4 flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-accent/20 via-background to-background/50 p-8 sm:p-10 sm:p-12 text-center overflow-hidden"
            >
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
              <div className="relative space-y-4">
                <div className="text-5xl sm:text-6xl">🌟</div>
                <h5 className="text-foreground font-bold text-xl sm:text-2xl tracking-tight">Life is about Balance</h5>
                <p className="text-muted-foreground text-sm sm:text-base max-w-xl leading-relaxed">
                  Code, create, and take time to enjoy every moment. The best ideas come when you step away from the keyboard.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {lightboxOpen && lightboxImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 bg-gradient-to-b from-black/85 via-black/60 to-transparent">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white/90 border border-white/10 shrink-0 overflow-hidden">
                  {activeHobbyIcon || "✨"}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm sm:text-base truncate">{activeHobbyTitle}</p>
                  <p className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    {lightboxImages.length > 0 ? `${lightboxIndex + 1} of ${lightboxImages.length}` : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={closeLightbox}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full sm:rounded-xl bg-white/10 active:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 shrink-0 touch-manipulation"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.96, x: 0 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex-1 flex items-center justify-center w-full min-h-0 px-2 sm:px-6 py-16 sm:py-20"
            >
              <img
                src={lightboxImages[lightboxIndex].src}
                alt={lightboxImages[lightboxIndex].alt}
                className="max-w-full max-h-full w-auto h-auto object-contain select-none rounded-lg sm:rounded-xl shadow-2xl"
                draggable={false}
              />
            </motion.div>

            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 active:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 shrink-0 z-20 touch-manipulation"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 active:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 shrink-0 z-20 touch-manipulation"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-2 px-3 sm:px-5 py-4 sm:py-5 bg-gradient-to-t from-black/85 via-black/50 to-transparent">
                  {lightboxImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                      className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30 touch-manipulation ${
                        idx === lightboxIndex
                          ? "w-8 sm:w-10 bg-sky-400"
                          : "w-2 bg-white/30 active:bg-white/60"
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {lightboxImages.length <= 1 && (
              <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-2 px-3 py-4 bg-gradient-to-t from-black/85 to-transparent">
                <button
                  onClick={closeLightbox}
                  className="text-white/80 text-xs sm:text-sm font-medium px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 active:bg-white/20 touch-manipulation"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <AIChatbot />
    </main>
  );
}
