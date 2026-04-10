"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  Swords,
  BarChart3,
  ShieldCheck,
  Zap,
  Globe2,
  Cpu,
  Sparkles,
  ArrowRight,
  Layers,
  Activity
} from "lucide-react";
import { useRef } from "react";

export default function LandingPage() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const features = [
    {
      icon: <Swords className="w-6 h-6 text-rose-400" />,
      title: "Multi-Agent Architecture",
      description: "Watch distinct AI personas argue both sides of complex topics autonomously.",
      color: "from-rose-500/20 to-rose-500/0",
      border: "border-rose-500/20",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
      title: "Live Fact-Checking",
      description: "An objective third-party agent monitors claims and ensures intellectual honesty.",
      color: "from-amber-500/20 to-amber-500/0",
      border: "border-amber-500/20",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-400" />,
      title: "Real-Time Scoring & Analytics",
      description: "A neutral moderator extracts strength signals and charts the debate dynamics using full analytics.",
      color: "from-emerald-500/20 to-emerald-500/0",
      border: "border-emerald-500/20",
    },
    {
      icon: <Cpu className="w-6 h-6 text-indigo-400" />,
      title: "LLM Agnostic",
      description: "Swap between Groq's Llama 3.3, Google's Gemini 2.0, or OpenAI instantly.",
      color: "from-indigo-500/20 to-indigo-500/0",
      border: "border-indigo-500/20",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Configure Topic",
      description: "Input any controversial subject and set the debate parameters.",
    },
    {
      number: "02",
      title: "Select Intelligence",
      description: "Assign different top-tier AI models to play the Proponent and Opponent.",
    },
    {
      number: "03",
      title: "Witness the Clash",
      description: "Watch the agents stream their arguments via real-time SSE protocols.",
    },
    {
      number: "04",
      title: "Analyze Outcomes",
      description: "Review the dynamic debate charting and semantic scoring analytics.",
    },
  ];

  const techStack = [
    { name: "Next.js 15", icon: <Globe2 className="w-5 h-5" /> },
    { name: "FastAPI", icon: <Zap className="w-5 h-5" /> },
    { name: "LangChain", icon: <Layers className="w-5 h-5" /> },
    { name: "SSE Streaming", icon: <Activity className="w-5 h-5" /> },
    { name: "Groq LPU", icon: <Cpu className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full" />
        <div className="absolute top-[40%] right-[-20%] w-[40%] h-[60%] bg-purple-600/15 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-10" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-400" />
            <span className="text-xl font-bold tracking-tight">Nexus</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={targetRef} className="relative pt-40 pb-20 px-6 min-h-[90vh] flex flex-col items-center justify-center">
        <motion.div
          style={{ opacity, scale, y }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 mb-8"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>The future of AI reasoning is multi-agent.</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
              The Ultimate
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
              Debate Arena
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Watch cutting-edge LLMs battle it out in real-time. Configurable personas, live fact-checking, and dynamic semantic scoring.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/arena">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8 h-14 text-lg shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all hover:scale-105">
                Start a Battle <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Abstract Floating UI Elements */}
        <div className="absolute top-1/2 left-10 md:left-20 -translate-y-1/2 hidden lg:block perspective-1000">
          <motion.div
            animate={{ y: [-20, 20, -20], rotateX: [10, -10, 10], rotateY: [-10, 10, -10] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-2xl backdrop-blur-md p-4 transform-gpu"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-zinc-800 rounded w-full" />
              <div className="h-2 bg-zinc-800 rounded w-4/5" />
              <div className="h-2 bg-zinc-800 rounded w-5/6" />
            </div>
          </motion.div>
        </div>

        <div className="absolute top-1/3 right-10 md:right-20 hidden lg:block perspective-1000">
          <motion.div
            animate={{ y: [20, -20, 20], rotateX: [-10, 10, -10], rotateY: [10, -10, 10] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="w-56 h-48 bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 rounded-2xl backdrop-blur-md p-4 transform-gpu"
          >
            <div className="flex justify-between items-end h-full pt-8 pb-2">
              {[40, 70, 45, 90, 65, 80].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, delay: i * 0.1 + 1 }}
                  className="w-4 bg-rose-500/40 rounded-t-sm"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Orchestrate brilliance.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Nexus isn't just a chat wrapper. It's a deterministic framework built specifically for pitting reasoning engines against each other.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`group relative p-8 rounded-3xl bg-zinc-900/40 border ${feature.border} overflow-hidden hover:bg-zinc-900/60 transition-colors backdrop-blur-sm`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="mb-6 inline-block p-3 rounded-2xl bg-black/50 border border-white/5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-zinc-500 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-32 bg-black border-y border-white/5 relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">How it works</h2>
              <p className="text-zinc-400 text-lg mb-12">
                A streamlined workflow designed to get you from concept to live debate in seconds.
              </p>

              <div className="space-y-8">
                {steps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex gap-6"
                  >
                    <div className="mt-1 flex flex-col items-center">
                      <div className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                        {step.number}
                      </div>
                      {idx !== steps.length - 1 && (
                        <div className="w-px h-16 bg-white/10 mt-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
                      <p className="text-zinc-500">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full perspective-1000">
              <motion.div
                initial={{ opacity: 0, rotateY: 20 }}
                whileInView={{ opacity: 1, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative rounded-2xl border border-white/10 bg-zinc-950 p-2 overflow-hidden shadow-2xl transform-gpu ring-1 ring-white/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-zinc-900/50">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="p-6 space-y-4 relative z-10">
                  <div className="flex gap-4 items-end">
                    <div className="w-8 h-8 rounded bg-emerald-500/20 shrink-0" />
                    <div className="p-3 bg-zinc-900 rounded-2xl rounded-bl-sm border border-white/5 w-3/4">
                      <div className="h-2 w-full bg-zinc-800 rounded mb-2" />
                      <div className="h-2 w-5/6 bg-zinc-800 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-4 items-end flex-row-reverse">
                    <div className="w-8 h-8 rounded bg-rose-500/20 shrink-0" />
                    <div className="p-3 bg-zinc-800/50 rounded-2xl rounded-br-sm border border-white/5 w-3/4 flex flex-col items-end">
                      <div className="h-2 w-full bg-zinc-700 rounded mb-2" />
                      <div className="h-2 w-4/5 bg-zinc-700 rounded mb-2" />
                      <div className="h-2 w-2/3 bg-zinc-700 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-1 items-center justify-center pt-2">
                    <BrainCircuit className="w-4 h-4 text-zinc-600 animate-pulse" />
                    <div className="h-1 w-1 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-1 w-1 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-1 w-1 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 border-b border-white/5 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-10">POWERED BY MODERN INFRASTRUCTURE</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60">
            {techStack.map((tech, idx) => (
              <div key={idx} className="flex items-center gap-2 text-zinc-300 font-medium">
                {tech.icon}
                <span>{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="py-10 border-t border-white/5 relative z-10 text-center text-zinc-600 text-sm">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BrainCircuit className="w-5 h-5" />
            <span className="font-semibold">Nexus Debate System</span>
          </div>
          <div className="flex gap-6">
          </div>
        </div>
      </footer>
    </div>
  );
}
