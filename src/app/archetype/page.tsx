"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  ShieldCheck, 
  RefreshCcw, 
  Share2, 
  Download,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  User,
  Bot
} from "lucide-react";
import { toPng } from "html-to-image";
import { cn } from "@/lib/utils";
import { ARCHETYPES } from "@/lib/archetypes";
import { calculateArchetype } from "@/lib/archetype-scorer";

const QUESTIONS = [
  {
    text: "WHEN DO YOU CLAIM YOUR REWARDS?",
    options: [
      { label: "As soon as I see a positive balance", value: 0 },
      { label: "Only during Normal electricity rates", value: 1 },
      { label: "Rarely — I let it build up for weeks", value: 2 },
      { label: "I don't have a pattern yet", value: 3 }
    ]
  },
  {
    text: "WHAT DO YOU DO WITH CLAIMED hCASH?",
    options: [
      { label: "Immediately buy more miners", value: 0 },
      { label: "Hold it — waiting for the right price", value: 1 },
      { label: "Mix of both depending on conditions", value: 2 },
      { label: "I haven't figured that out yet", value: 3 }
    ]
  },
  {
    text: "HOW DO YOU CHOOSE MINERS?",
    options: [
      { label: "Best hashrate for my budget, period", value: 0 },
      { label: "Most efficient (lowest power per TH)", value: 1 },
      { label: "Whatever's cheap on the market right now", value: 2 },
      { label: "I just buy what I can afford", value: 3 }
    ]
  },
  {
    text: "HOW DO YOU FEEL ABOUT HALVINGS?",
    options: [
      { label: "I specifically plan my moves around them", value: 0 },
      { label: "I don't think about them much", value: 1 },
      { label: "They're a threat — I prepare by stacking up before", value: 2 },
      { label: "Still learning what halvings actually mean", value: 3 }
    ]
  },
  {
    text: "WHAT'S YOUR PRIMARY GOAL IN HASHCASH?",
    options: [
      { label: "Maximum long-term hCASH accumulation", value: 0 },
      { label: "Efficient daily earnings with minimal waste", value: 1 },
      { label: "Profit from both mining AND miner trading", value: 2 },
      { label: "Still exploring — no clear goal yet", value: 3 }
    ]
  },
  {
    text: "HOW DO YOU REACT WHEN NETWORK HASHRATE JUMPS?",
    options: [
      { label: "Buy more miners immediately — compete harder", value: 0 },
      { label: "Optimize current setup to maintain efficiency", value: 1 },
      { label: "Watch and wait — might be a buying opportunity", value: 2 },
      { label: "Feel anxious — not sure what to do", value: 3 }
    ]
  }
];

export default function ArchetypePage() {
  const [phase, setPhase] = useState<"assessment" | "scanning" | "reveal" | "profile">("assessment");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [archetypeId, setArchetypeId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const currentArchetype = useMemo(() => 
    ARCHETYPES.find(a => a.id === archetypeId), [archetypeId]
  );

  const handleAnswer = (val: number) => {
    const newAnswers = [...answers, val];
    setAnswers(newAnswers);
    
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      startScanning(newAnswers);
    }
  };

  const startScanning = (finalAnswers: number[]) => {
    setPhase("scanning");
    const result = calculateArchetype(finalAnswers);
    
    setTimeout(() => {
      setArchetypeId(result);
      setPhase("reveal");
    }, 4500); // 3 passes of scanning
  };

  const handleGetAiStrategy = async () => {
    if (!currentArchetype) return;
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `I have been classified as ${currentArchetype.name} in the HashPilot archetype system. My tagine is: "${currentArchetype.tagline}". Based on this classification, give me a specific, actionable 3-month strategy roadmap. Be encouraging but honest about my vulnerabilities (${currentArchetype.weakness}). Speak as a high-level mining consultant.`
          }]
        })
      });
      // Handle non-streaming for simplicity in this specific block or use a reader
      // For archetype we'll use a simple text response if possible or standard stream format
      const reader = response.body?.getReader();
      let accumulated = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const json = JSON.parse(data);
                if (json.type === 'content_block_delta') {
                  accumulated += json.delta.text;
                  setAiAdvice(accumulated);
                }
              } catch (err) {
                console.error(err);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const shareTw = () => {
    if (!currentArchetype) return;
    const text = `Just got classified by HashPilot AI ⬡\nI'm ${currentArchetype.name} ${currentArchetype.symbol}\n'${currentArchetype.tagline}'\nWhat's your mining archetype? → hashpilot.app\n#HashCash #hCASH #Avalanche`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden bg-hp-background font-sans">
      <AnimatePresence mode="wait">
        {/* PHASE 1: ASSESSMENT */}
        {phase === "assessment" && (
          <motion.div 
            key="assessment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto px-6 pt-20 flex flex-col items-center"
          >
            <div className="w-full mb-12 flex justify-between items-end border-b border-hp-border pb-4">
              <div>
                <h1 className="font-mono text-hp-accent-amber text-xs tracking-[0.4em] uppercase mb-1">
                  IDENTITY SCAN — MINER CLASSIFICATION PROTOCOL
                </h1>
                <p className="font-mono text-hp-text-muted text-[10px] uppercase">
                  Step {currentQuestion + 1} of {QUESTIONS.length}
                </p>
              </div>
              <div className="font-display text-xl text-hp-accent-amber">
                SCAN {currentQuestion + 1}/{QUESTIONS.length}
              </div>
            </div>

            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <h2 className="font-display text-2xl md:text-3xl text-white mb-10 tracking-tight uppercase leading-tight">
                {QUESTIONS[currentQuestion].text}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {QUESTIONS[currentQuestion].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt.value)}
                    className="group bg-hp-surface border border-hp-border hover:border-hp-accent-amber p-6 rounded-sm text-left transition-all flex items-center justify-between"
                  >
                    <span className="font-mono text-sm text-hp-text-primary group-hover:text-hp-accent-amber transition-colors">
                      {opt.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-hp-text-muted group-hover:text-hp-accent-amber transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* PHASE 2: SCANNING */}
        {phase === "scanning" && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6"
          >
            {/* The Horizontal Scan Line */}
            <motion.div 
              className="absolute left-0 right-0 h-1 bg-hp-accent-amber shadow-[0_0_30px_rgba(245,166,35,0.8)] z-10"
              animate={{ top: ["0%", "100%", "0%", "100%", "0%", "100%"] }}
              transition={{ duration: 4.5, ease: "easeInOut" }}
            />
            
            <div className="text-center font-mono space-y-4">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-hp-accent-amber text-lg tracking-[0.5em] uppercase"
              >
                ANALYZING CLAIM PATTERNS...
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-hp-accent-amber text-lg tracking-[0.5em] uppercase"
              >
                CROSS-REFERENCING STRATEGY MATRIX...
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="text-hp-accent-green text-lg tracking-[0.5em] uppercase font-bold"
              >
                CLASSIFICATION CONFIRMED.
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* PHASE 3: REVEAL */}
        {phase === "reveal" && currentArchetype && (
          <motion.div 
            key="reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-xl"
          >
            <div className="text-center max-w-2xl">
              <span className="font-mono text-hp-text-muted uppercase tracking-[0.8em] text-xs mb-4 block">YOU ARE</span>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-6 uppercase"
                style={{ color: currentArchetype.color, filter: `drop-shadow(0 0 20px ${currentArchetype.color}44)` }}
              >
                {currentArchetype.name}
              </motion.div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1.2 }}
                className="text-6xl md:text-8xl mb-8 block"
              >
                {currentArchetype.symbol}
              </motion.div>
              <p className="font-mono text-lg text-hp-text-primary italic mb-12 opacity-80 uppercase tracking-widest leading-relaxed">
                &quot;{currentArchetype.tagline}&quot;
              </p>
              <button
                onClick={() => setPhase("profile")}
                className="bg-hp-accent-amber hover:bg-amber-400 text-hp-background font-display font-black px-10 py-4 rounded-sm transition-all tracking-widest uppercase flex items-center gap-3 mx-auto"
              >
                YOUR STRATEGY PROFILE <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* PHASE 4: PROFILE */}
        {phase === "profile" && currentArchetype && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-6 pt-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* LEFT: THE BADGE */}
              <div className="lg:col-span-5">
                <BadgeCard archetype={currentArchetype} />
                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={shareTw}
                    className="flex-1 bg-white hover:bg-gray-200 text-black font-display font-bold py-3 rounded-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Share2 size={18} /> SHARE
                  </button>
                  <button 
                    onClick={() => setPhase("assessment")}
                    className="flex-1 border border-hp-border hover:border-hp-accent-amber text-hp-text-muted hover:text-hp-accent-amber font-mono text-xs uppercase tracking-widest py-3 rounded-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <RefreshCcw size={14} /> RETAKE
                  </button>
                </div>
              </div>

              {/* RIGHT: STRATEGY */}
              <div className="lg:col-span-7 space-y-12">
                <section>
                  <h3 className="font-mono text-hp-accent-amber text-xs tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                    <User size={14} /> CORE IDENTITY
                  </h3>
                  <p className="text-hp-text-primary font-mono leading-relaxed text-lg italic opacity-80">
                    {currentArchetype.description}
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <h3 className="font-mono text-hp-accent-green text-[10px] tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                      <CheckCircle2 size={14} /> STRENGTHS
                    </h3>
                    <ul className="space-y-3">
                      {currentArchetype.strengths.map((s, i) => (
                        <li key={i} className="flex items-center gap-3 text-hp-text-secondary font-mono text-xs uppercase">
                          <div className="w-1.5 h-1.5 bg-hp-accent-green rounded-full shadow-[0_0_8px_rgba(57,255,10,0.4)]" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="font-mono text-hp-accent-red text-[10px] tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                      <AlertTriangle size={14} /> VULNERABILITY
                    </h3>
                    <div className="bg-hp-accent-red/5 border border-hp-accent-red/20 p-4 rounded-sm">
                      <p className="text-xs font-mono text-hp-accent-red uppercase tracking-wider leading-relaxed">
                        {currentArchetype.weakness}
                      </p>
                    </div>
                  </section>
                </div>

                <section className="bg-hp-surface border border-hp-border p-8 rounded-sm">
                  <h3 className="font-mono text-hp-accent-blue text-[10px] tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
                    <Zap size={14} /> YOUR 3-MOVE PLAYBOOK
                  </h3>
                  <div className="space-y-6">
                    {currentArchetype.strategy.map((s, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <span className="font-display text-4xl text-hp-border font-black leading-none">{i+1}</span>
                        <div className="font-mono pt-1">
                          <span className="text-[10px] text-hp-text-muted uppercase block mb-1">EXECUTE COMMAND:</span>
                          <span className="text-sm text-hp-text-primary uppercase tracking-wide font-bold">{s}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* AI PERSO */}
                <section className="space-y-6">
                  {!aiAdvice ? (
                    <button
                      onClick={handleGetAiStrategy}
                      disabled={isAiLoading}
                      className="w-full group bg-hp-accent-blue hover:bg-blue-400 text-hp-background font-display font-black py-4 rounded-sm transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                    >
                      <Bot size={20} /> ⬡ GET AI STRATEGY ROADMAP
                    </button>
                  ) : (
                    <div className="bg-hp-surface border-2 border-hp-accent-blue p-8 rounded-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-hp-accent-blue opacity-[0.03] rotate-45 translate-x-16 -translate-y-16" />
                      <h4 className="font-mono text-hp-accent-blue text-xs tracking-[0.4em] uppercase mb-6 flex items-center gap-3">
                        <Bot size={16} /> HASHPILOT STRATEGY COMMS
                      </h4>
                      <div className="prose prose-invert max-w-none prose-sm font-mono leading-loose text-hp-text-primary whitespace-pre-wrap italic">
                        {aiAdvice}
                      </div>
                      <div className="mt-8 pt-4 border-t border-hp-border text-[9px] font-mono text-hp-text-muted uppercase flex justify-between">
                        <span>Transmission Verified // Claude 3.5</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>

            {/* GALLERY */}
            <div className="mt-32 pt-20 border-t border-hp-border pb-12 overflow-hidden">
              <h4 className="font-mono text-hp-text-muted text-[10px] uppercase tracking-[0.5em] mb-12 text-center">THE ARCHETYPE REGISTRY</h4>
              <div className="flex gap-6 overflow-x-auto pb-8 mask-fade-right container-snap">
                {ARCHETYPES.map((a) => (
                  <div 
                    key={a.id}
                    className={cn(
                      "min-w-[280px] bg-hp-surface border p-6 rounded-sm transition-all relative flex flex-col items-center text-center",
                      a.id === archetypeId ? "border-hp-accent-amber ring-1 ring-hp-accent-amber" : "border-hp-border opacity-60"
                    )}
                  >
                    {a.id === archetypeId && (
                      <div className="absolute -top-3 bg-hp-accent-amber text-hp-background text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                        MY IDENTITY
                      </div>
                    )}
                    <span className="text-4xl mb-4 grayscale-[0.5]">{a.symbol}</span>
                    <h5 className="font-display text-lg font-bold text-white mb-2 tracking-tight">{a.name}</h5>
                    <p className="text-[10px] font-mono text-hp-text-muted uppercase leading-relaxed line-clamp-2">
                      {a.tagline}
                    </p>
                    {a.id !== archetypeId && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                         <ShieldCheck className="text-hp-border" size={32} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BadgeCard({ archetype }: { archetype: { id: string; name: string; symbol: string; color: string; tagline: string; strengths: string[] } }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const download = async () => {
    if (!cardRef.current) return;
    const url = await toPng(cardRef.current, { pixelRatio: 2 });
    const l = document.createElement('a');
    l.download = `archetype-${archetype.id}.png`;
    l.href = url;
    l.click();
  };

  return (
    <div className="space-y-4">
      {/* SHARABLE CONTAINER */}
      <div 
        ref={cardRef}
        className="aspect-[4/5] bg-[#050810] border-[12px] border-hp-surface p-8 relative flex flex-col items-center justify-center text-center overflow-hidden"
      >
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#F5A623 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
        
        {/* Visual Decoration */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 opacity-50" style={{ borderColor: archetype.color }} />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 opacity-50" style={{ borderColor: archetype.color }} />
        
        <div className="relative z-10 w-full">
          <span className="font-mono text-[10px] text-hp-text-muted tracking-[0.5em] block mb-8 uppercase">HASHPILOT // MINER PROFILE</span>
          
          <div 
            className="text-8xl mb-8 block drop-shadow-2xl"
            style={{ filter: `drop-shadow(0 0 20px ${archetype.color}44)` }}
          >
            {archetype.symbol}
          </div>
          
          <h2 className="font-display text-4xl font-bold tracking-tighter mb-4" style={{ color: archetype.color }}>
            {archetype.name}
          </h2>
          
          <p className="font-mono text-sm text-hp-text-primary italic mb-10 opacity-70">
            &quot;{archetype.tagline}&quot;
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {archetype.strengths.slice(0, 3).map((s: string, i: number) => (
              <span key={i} className="text-[9px] font-mono border border-hp-border px-3 py-1 text-hp-text-secondary uppercase">
                {s}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-2 opacity-30 mt-auto">
            <ShieldCheck size={12} />
            <span className="font-mono text-[9px] tracking-widest uppercase">VERIFIED STATUS // hashpilot.app</span>
          </div>
        </div>
      </div>

      <button 
        onClick={download} 
        className="w-full flex items-center justify-center gap-2 text-[10px] font-mono text-hp-text-muted hover:text-hp-accent-amber transition-all uppercase tracking-[0.2em]"
      >
        <Download size={14} /> Download Badge PNG
      </button>
    </div>
  );
}
