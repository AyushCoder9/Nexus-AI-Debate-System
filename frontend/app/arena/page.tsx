"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Mic2,
  MessageSquare,
  ShieldAlert,
  BarChart3,
  Settings2,
  Play,
  BrainCircuit,
  Zap,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ── Types ─────────────────────── */
interface Message {
  role: "proponent" | "opponent" | "moderator" | "fact_checker";
  content: string;
  round: number;
}
interface Score {
  round: number;
  proponent: number;
  opponent: number;
}
interface DebateConfig {
  topic: string;
  rounds: number;
  proponent_model: string;
  opponent_model: string;
  moderator_model: string;
  fact_checker_model: string;
  proponent_persona: string;
  opponent_persona: string;
}

/* ── Constants ─────────────────── */
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://nexus-ai-debate-system.onrender.com";

const MODELS = [
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google" },
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", provider: "groq" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", provider: "groq" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai" },
];

const SUGGESTED_TOPICS = [
  "Should artificial intelligence be granted legal personhood?",
  "Is universal basic income the solution to automation-driven unemployment?",
  "Should genetic engineering in humans be allowed?",
  "Is social media doing more harm than good to society?",
  "Should space colonization be prioritized over solving Earth's problems?",
  "Is remote work better than office work for productivity?",
  "Should governments regulate cryptocurrency?",
  "Is nuclear energy the best path to a carbon-free future?",
];

/* ── Demo Data (no API needed) ── */
const DEMO_MESSAGES: Message[] = [
  {
    role: "proponent",
    content:
      "Artificial intelligence should be granted legal personhood because it enables clear accountability frameworks. When an autonomous system causes harm—whether through a self-driving car accident or an algorithmic hiring decision—legal personhood provides a structured way to assign liability, seek remedies, and protect affected individuals. This mirrors how we've extended personhood to corporations, which are also non-human entities.",
    round: 1,
  },
  {
    role: "opponent",
    content:
      "Granting AI legal personhood is fundamentally misguided. Unlike corporations, which are comprised of humans making decisions, AI systems lack consciousness, moral agency, and genuine understanding. Legal personhood would actually dilute accountability by allowing developers and deployers to hide behind an AI 'person,' making it harder for victims to seek justice from the real humans responsible for designing and releasing these systems.",
    round: 1,
  },
  {
    role: "fact_checker",
    content:
      "Both speakers raise valid points. The Proponent's comparison to corporate personhood is historically accurate—corporations have held legal personhood since the 19th century. However, the Opponent correctly notes that corporate personhood involves human decision-makers. Current AI systems, including large language models, do not possess consciousness or moral agency by any accepted scientific definition.",
    round: 1,
  },
  {
    role: "moderator",
    content:
      "Round 1 Summary: The Proponent argued for AI personhood as an accountability framework, drawing a parallel to corporate personhood. The Opponent countered that AI lacks consciousness and moral agency, warning it could shield human developers from liability. The Fact-Checker confirmed the historical accuracy while noting a key distinction.\n\nScores — Proponent: 7/10 (strong framework argument) | Opponent: 8/10 (effectively identified the accountability paradox)",
    round: 1,
  },
  {
    role: "proponent",
    content:
      "My opponent raises a fair concern, but the accountability paradox can be resolved with tiered liability models. AI personhood doesn't replace human accountability—it supplements it. Consider that an AI 'person' could be required to carry insurance, maintain audit trails, and submit to regulatory oversight. This creates an additional layer of protection for citizens, not fewer safeguards. The rapid advancement of agentic AI systems makes this framework increasingly urgent.",
    round: 2,
  },
  {
    role: "opponent",
    content:
      "The insurance and audit trail argument actually strengthens the case against AI personhood. We can mandate insurance requirements and audit trails on the companies deploying AI without the legal fiction of personhood. Creating a new legal category of 'person' for machines that don't think or feel sets a dangerous philosophical precedent and trivializes the very concept of personhood that underpins human rights law globally.",
    round: 2,
  },
  {
    role: "fact_checker",
    content:
      "The Proponent's mention of tiered liability models has academic support in legal scholarship. However, the Opponent's observation is also substantiated—existing product liability and corporate governance law already provides mechanisms for AI accountability without requiring personhood. The EU AI Act (2024) takes this approach, regulating AI through existing legal frameworks rather than granting personhood.",
    round: 2,
  },
  {
    role: "moderator",
    content:
      "Round 2 Summary: The Proponent proposed a practical tiered-liability model combining AI personhood with insurance mandates. The Opponent argued these safeguards are achievable without personhood, pointing to existing legal frameworks. The Fact-Checker cited the EU AI Act as real-world evidence supporting the Opponent's position.\n\nScores — Proponent: 7/10 (practical proposal but didn't address the philosophical concern) | Opponent: 8/10 (effectively used real-world legislation as evidence)\n\nFinal Verdict: The Opponent wins this debate 16-14 on aggregate, primarily due to stronger real-world evidence and a compelling philosophical argument against trivializing personhood.",
    round: 2,
  },
];

const DEMO_SCORES: Score[] = [
  { round: 1, proponent: 7, opponent: 8 },
  { round: 2, proponent: 7, opponent: 8 },
];

/* ── Component ─────────────────── */
export default function AIDebatePage() {
  const [activeTab, setActiveTab] = useState("debate");
  const [config, setConfig] = useState<DebateConfig>({
    topic: "",
    rounds: 3,
    proponent_model: "gemini-2.0-flash",
    opponent_model: "gemini-2.0-flash",
    moderator_model: "gemini-2.0-flash",
    fact_checker_model: "gemini-2.0-flash",
    proponent_persona: "Logical and Evidence-based",
    opponent_persona: "Skeptical and Critical",
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDebating, setIsDebating] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /* ── Score extraction helper ── */
  const extractScores = useCallback((content: string, round: number) => {
    const proMatch = content.match(/proponent[:\s]*(\d+)/i);
    const oppMatch = content.match(/opponent[:\s]*(\d+)/i);
    if (proMatch || oppMatch) {
      setScores((prev) => [
        ...prev,
        {
          round,
          proponent: proMatch ? parseInt(proMatch[1]) : 5,
          opponent: oppMatch ? parseInt(oppMatch[1]) : 5,
        },
      ]);
    }
  }, []);

  /* ── Quick Demo (offline, no API) ── */
  const runDemo = useCallback(async () => {
    setMessages([]);
    setScores([]);
    setError(null);
    setIsDebating(true);
    setActiveTab("debate");

    for (const msg of DEMO_MESSAGES) {
      await new Promise((r) => setTimeout(r, 800));
      setMessages((prev) => [...prev, msg]);
      if (msg.role === "moderator") {
        extractScores(msg.content, msg.round);
      }
    }
    setIsDebating(false);
  }, [extractScores]);

  /* ── Real debate via SSE ── */
  const startDebate = useCallback(async () => {
    if (!config.topic) return;

    setMessages([]);
    setScores([]);
    setError(null);
    setIsDebating(true);
    setActiveTab("debate");

    try {
      const response = await fetch(`${BACKEND_URL}/debate/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text}`);
      }

      if (!response.body) {
        throw new Error("No response body — streaming not supported");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Strip \r chars — sse_starlette sends \r\r\n which breaks parsing
        buffer += decoder.decode(value, { stream: true }).replace(/\r/g, "");
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          let eventType = "message";
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            if (line.startsWith("data: ")) dataStr = line.slice(6).trim();
          }

          if (eventType === "error") {
            setError(dataStr);
            setIsDebating(false);
            return;
          }

          if (eventType === "done") {
            setIsDebating(false);
            return;
          }

          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              if (data && data.role) {
                setMessages((prev) => [...prev, data]);
                if (data.role === "moderator") {
                  extractScores(data.content, data.round);
                }
              }
            } catch {
              // skip malformed data lines
            }
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsDebating(false);
    }
  }, [config, extractScores]);

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 selection:bg-indigo-500/30">
      <AnimatePresence>
        {isInitializing && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0b]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center mb-8 relative"
            >
              <div className="absolute inset-0 bg-indigo-600/30 blur-[60px] rounded-full" />
              <BrainCircuit className="w-24 h-24 text-indigo-500 animate-[pulse_2s_ease-in-out_infinite] relative z-10" />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-extrabold tracking-[0.2em] uppercase mb-6 text-zinc-100"
            >
              Initializing Arena
            </motion.h2>

            <div className="flex items-end justify-center gap-2 mb-8 h-12">
               <motion.div initial={{ height: 0 }} animate={{ height: 24 }} transition={{ delay: 0.5, duration: 0.5 }} className="w-1.5 rounded-t-sm bg-indigo-500" />
               <motion.div initial={{ height: 0 }} animate={{ height: 40 }} transition={{ delay: 0.6, duration: 0.8 }} className="w-1.5 rounded-t-sm bg-purple-500" />
               <motion.div initial={{ height: 0 }} animate={{ height: 16 }} transition={{ delay: 0.7, duration: 0.4 }} className="w-1.5 rounded-t-sm bg-emerald-500" />
               <motion.div initial={{ height: 0 }} animate={{ height: 32 }} transition={{ delay: 0.8, duration: 0.6 }} className="w-1.5 rounded-t-sm bg-rose-500" />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-indigo-400/80 font-mono text-sm tracking-widest uppercase animate-pulse"
            >
              Establishing Neural Links...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full" />
        <div className="absolute top-[40%] right-[-20%] w-[40%] h-[60%] bg-purple-600/15 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-10" />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ── Header ── */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10"
        >
          <div>
            <Link href="/" className="flex items-center gap-3 mb-2 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)]">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500 hover:text-white transition-colors">
                Nexus Debate
              </h1>
            </Link>
            <p className="text-zinc-400 text-lg">Multi-Agent AI Argumentation System</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="group border border-zinc-700/50 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)] backdrop-blur-md relative overflow-hidden"
              onClick={runDemo}
              disabled={isDebating}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Zap className="w-4 h-4 mr-2 text-yellow-500 group-hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] transition-all" />
              Quick Demo
            </Button>
            <Button
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] transition-all duration-300 hover:scale-105 border border-white/10 relative overflow-hidden"
              onClick={startDebate}
              disabled={isDebating || !config.topic}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Play className="w-4 h-4 mr-2" />
              Start Battle
            </Button>
          </div>
        </motion.header>

        {/* ── Error Banner ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Debate Error</p>
                <p className="text-sm text-red-400 mt-1">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* ── Sidebar / Config ── */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-4 space-y-6"
          >
            <Card className="bg-zinc-900/60 border border-white/5 backdrop-blur-2xl shadow-[0_0_50px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-zinc-100">
                  <Settings2 className="w-5 h-5 text-indigo-400 group-hover:rotate-90 transition-transform duration-500" />
                  Configuration
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  Fine-tune the debate parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                {/* Topic Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Debate Topic</label>
                  <Input
                    placeholder="Enter a controversial topic..."
                    className="bg-zinc-950/80 border border-zinc-800/80 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-zinc-200 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] rounded-xl"
                    value={config.topic}
                    onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                  />
                </div>

                {/* Suggested Topics */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Suggested Topics
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TOPICS.map((t, i) => (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.05, duration: 0.3 }}
                        key={i}
                        onClick={() => setConfig({ ...config, topic: t })}
                        className="text-xs px-3 py-1.5 rounded-full bg-zinc-950/50 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:shadow-[0_0_15px_-3px_rgba(79,70,229,0.3)] transition-all duration-300 text-left cursor-pointer"
                      >
                        {t.length > 45 ? t.slice(0, 45) + "…" : t}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Rounds */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Rounds</label>
                    <Select
                      value={config.rounds.toString()}
                      onValueChange={(v) => setConfig({ ...config, rounds: parseInt(v || "3") })}
                    >
                      <SelectTrigger className="bg-zinc-950/50 border-zinc-800 text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectItem value="1">1 Round</SelectItem>
                        <SelectItem value="2">2 Rounds</SelectItem>
                        <SelectItem value="3">3 Rounds</SelectItem>
                        <SelectItem value="5">5 Rounds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Agent Models */}
                <div className="space-y-4 pt-4 border-t border-zinc-800">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Agent Intelligence
                  </h3>
                  <div className="space-y-4">
                    {/* Proponent */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-zinc-300">Proponent</label>
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase border-emerald-500/20 text-emerald-500 bg-emerald-500/5"
                        >
                          FOR
                        </Badge>
                      </div>
                      <Select
                        value={config.proponent_model}
                        onValueChange={(v) =>
                          setConfig({ ...config, proponent_model: v || "gemini-2.0-flash" })
                        }
                      >
                        <SelectTrigger className="bg-zinc-950/80 border border-zinc-800/80 text-zinc-200 rounded-xl hover:border-emerald-500/30 transition-colors shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                          <div className="flex items-center gap-1.5 truncate">
                            <span>{MODELS.find(m => m.id === config.proponent_model)?.name || "Select Model"}</span>
                            <span className="text-zinc-500 text-[10px] uppercase leading-none mt-[1px]">
                              {MODELS.find(m => m.id === config.proponent_model)?.provider}
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                          {MODELS.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                              <span className="ml-1.5 text-zinc-500 text-[10px] uppercase">
                                {m.provider}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Opponent */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-zinc-300">Opponent</label>
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase border-rose-500/20 text-rose-500 bg-rose-500/5"
                        >
                          AGAINST
                        </Badge>
                      </div>
                      <Select
                        value={config.opponent_model}
                        onValueChange={(v) =>
                          setConfig({ ...config, opponent_model: v || "gemini-2.0-flash" })
                        }
                      >
                        <SelectTrigger className="bg-zinc-950/80 border border-zinc-800/80 text-zinc-200 rounded-xl hover:border-rose-500/30 transition-colors shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                          <div className="flex items-center gap-1.5 truncate">
                            <span>{MODELS.find(m => m.id === config.opponent_model)?.name || "Select Model"}</span>
                            <span className="text-zinc-500 text-[10px] uppercase leading-none mt-[1px]">
                              {MODELS.find(m => m.id === config.opponent_model)?.provider}
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                          {MODELS.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                              <span className="ml-1.5 text-zinc-500 text-[10px] uppercase">
                                {m.provider}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Moderator / Fact-Checker */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">
                        Moderator / Fact-Checker
                      </label>
                      <Select
                        value={config.moderator_model}
                        onValueChange={(v) =>
                          setConfig({
                            ...config,
                            moderator_model: v || "gemini-2.0-flash",
                            fact_checker_model: v || "gemini-2.0-flash",
                          })
                        }
                      >
                        <SelectTrigger className="bg-zinc-950/80 border border-zinc-800/80 text-zinc-200 rounded-xl hover:border-amber-500/30 transition-colors shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                          <div className="flex items-center gap-1.5 truncate">
                            <span>{MODELS.find(m => m.id === config.moderator_model)?.name || "Select Model"}</span>
                            <span className="text-zinc-500 text-[10px] uppercase leading-none mt-[1px]">
                              {MODELS.find(m => m.id === config.moderator_model)?.provider}
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                          {MODELS.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                              <span className="ml-1.5 text-zinc-500 text-[10px] uppercase">
                                {m.provider}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Main Visualizer ── */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lg:col-span-8"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-zinc-900/60 border border-zinc-800/80 w-full mb-6 p-1.5 h-16 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)]">
                <TabsTrigger
                  value="debate"
                  className="flex-1 text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-zinc-800/80 data-[state=active]:text-white h-full rounded-xl transition-all data-[state=active]:shadow-md border border-transparent data-[state=active]:border-white/5"
                >
                  <MessageSquare className="w-5 h-5 mr-3" />
                  <span className="font-semibold tracking-wide">Arena</span>
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex-1 text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-zinc-800/80 data-[state=active]:text-white h-full rounded-xl transition-all data-[state=active]:shadow-md border border-transparent data-[state=active]:border-white/5"
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  <span className="font-semibold tracking-wide">Analytics</span>
                </TabsTrigger>
              </TabsList>

              {/* ── Arena Tab ── */}
              <TabsContent value="debate" className="mt-0">
                <Card className="bg-zinc-900/60 border border-white/5 backdrop-blur-2xl shadow-[0_0_50px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group h-[650px] flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />
                  <div className="flex-1 p-6 overflow-y-auto relative z-10" ref={scrollRef}>
                    <div className="space-y-6">
                      {messages.length === 0 && !isDebating && (
                        <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-4">
                          <div className="bg-zinc-800 p-4 rounded-full">
                            <Mic2 className="w-8 h-8 text-zinc-500" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-zinc-300">
                              The Arena is Quiet
                            </h3>
                            <p className="text-zinc-500 max-w-xs mx-auto">
                              Pick a topic and click &quot;Start Battle&quot; — or try the
                              &quot;Quick Demo&quot; to preview a debate without API calls.
                            </p>
                          </div>
                        </div>
                      )}

                      <AnimatePresence>
                        {messages.map((msg, i) => (
                          <motion.div
                            key={`${msg.role}-${msg.round}-${i}`}
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className={`flex ${
                              msg.role === "proponent" || msg.role === "moderator"
                                ? "flex-row"
                                : "flex-row-reverse"
                            } gap-4`}
                          >
                            <Avatar
                              className={`h-10 w-10 shrink-0 border-2 ${
                                msg.role === "proponent"
                                  ? "border-emerald-500/30"
                                  : msg.role === "opponent"
                                  ? "border-rose-500/30"
                                  : msg.role === "moderator"
                                  ? "border-indigo-500/30"
                                  : "border-amber-500/30"
                              }`}
                            >
                              <AvatarFallback
                                className={`text-xs font-bold ${
                                  msg.role === "proponent"
                                    ? "bg-emerald-950 text-emerald-400"
                                    : msg.role === "opponent"
                                    ? "bg-rose-950 text-rose-400"
                                    : msg.role === "moderator"
                                    ? "bg-indigo-950 text-indigo-400"
                                    : "bg-amber-950 text-amber-400"
                                }`}
                              >
                                {msg.role === "proponent"
                                  ? "PRO"
                                  : msg.role === "opponent"
                                  ? "OPP"
                                  : msg.role === "moderator"
                                  ? "MOD"
                                  : "FCK"}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`flex flex-col max-w-[85%] ${
                                msg.role === "opponent" ? "items-end" : "items-start"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                  {msg.role.replace("_", " ")} &middot; Round {msg.round}
                                </span>
                                {msg.role === "fact_checker" && (
                                  <ShieldAlert className="w-3 h-3 text-amber-500" />
                                )}
                              </div>
                              <div
                                className={`p-5 rounded-2xl leading-relaxed text-sm shadow-[0_4px_20px_-5px_rgba(0,0,0,0.3)] backdrop-blur-md relative overflow-hidden ${
                                  msg.role === "moderator"
                                    ? "bg-indigo-600/10 border border-indigo-500/20 text-zinc-100"
                                    : msg.role === "fact_checker"
                                    ? "bg-amber-600/5 border border-amber-500/20 italic text-amber-100/90"
                                    : msg.role === "proponent"
                                    ? "bg-zinc-800/80 border border-emerald-500/10 text-emerald-50"
                                    : "bg-zinc-900/80 border border-rose-500/10 text-rose-50"
                                }`}
                              >
                                {msg.role === "proponent" && <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-emerald-500/50 to-transparent opacity-30" />}
                                {msg.role === "opponent" && <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-l from-rose-500/50 to-transparent opacity-30" />}
                                {msg.role === "moderator" && <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-indigo-500/50 to-transparent opacity-50" />}
                                
                                <span className="relative z-10">{msg.content}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {isDebating && (
                        <div className="flex items-center gap-2 text-zinc-500 animate-pulse py-4">
                          <BrainCircuit className="w-4 h-4 animate-[spin_8s_linear_infinite]" />
                          <span className="text-sm">Nexus is thinking…</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* ── Analytics Tab ── */}
              <TabsContent value="analytics" className="mt-0">
                <Card className="bg-zinc-900/60 border border-white/5 backdrop-blur-2xl shadow-[0_0_50px_-20px_rgba(0,0,0,0.5)] p-8 h-[650px] flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />
                  
                  {scores.length > 0 ? (
                    <div className="h-full flex flex-col relative z-10">
                      <h3 className="text-2xl font-bold mb-8 text-center text-zinc-100">
                        Argument Strength Analytics
                      </h3>
                      <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={scores}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                            <XAxis dataKey="round" stroke="#71717a" />
                            <YAxis stroke="#71717a" domain={[0, 10]} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#18181b",
                                border: "1px solid #3f3f46",
                                borderRadius: "8px",
                              }}
                              itemStyle={{ color: "#f4f4f5" }}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Line
                              type="monotone"
                              dataKey="proponent"
                              name="Proponent (FOR)"
                              stroke="#10b981"
                              strokeWidth={3}
                              dot={{ r: 6 }}
                              activeDot={{ r: 8 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="opponent"
                              name="Opponent (AGAINST)"
                              stroke="#f43f5e"
                              strokeWidth={3}
                              dot={{ r: 6 }}
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
                          <p className="text-zinc-500 text-sm mb-1 uppercase tracking-wider font-semibold">
                            Proponent Avg
                          </p>
                          <p className="text-3xl font-bold text-emerald-400">
                            {(
                              scores.reduce((a, c) => a + c.proponent, 0) / scores.length
                            ).toFixed(1)}
                          </p>
                        </div>
                        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 text-center">
                          <p className="text-zinc-500 text-sm mb-1 uppercase tracking-wider font-semibold">
                            Opponent Avg
                          </p>
                          <p className="text-3xl font-bold text-rose-400">
                            {(
                              scores.reduce((a, c) => a + c.opponent, 0) / scores.length
                            ).toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 relative z-10">
                      <BarChart3 className="w-16 h-16 text-indigo-500/50" />
                      <div>
                        <h3 className="text-xl font-semibold text-zinc-300">No Analytics Yet</h3>
                        <p className="text-zinc-500 max-w-xs mx-auto">
                          Start a debate to see real-time scoring and argument strength analysis.
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* ── Footer ── */}
        <footer className="mt-20 py-8 border-t border-zinc-900 flex justify-between items-center text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-medium uppercase tracking-widest">Nexus System Online</p>
          </div>
          <div className="flex gap-6 text-sm">
          </div>
        </footer>
      </main>
    </div>
  );
}
