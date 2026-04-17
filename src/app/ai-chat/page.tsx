"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const STARTER_TIPS = [
  "💡 HashPilot AI factors in network spikes if you ask about recent blocks.",
  "⚡ Ask HashPilot AI to compare two miners directly to see payback days.",
  "📉 Predict your earnings post-halving by asking 'How does a halving hit my Standard facility?'",
];

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  
  // Setup Context
  const [hashrate, setHashrate] = useState("500");
  const [tier, setTier] = useState("STANDARD");
  const [balance, setBalance] = useState("450");
  const [rate, setRate] = useState("NORMAL");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % STARTER_TIPS.length);
    }, 15000); // 15 seconds cycle
    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (messageText: string = input) => {
    if (!messageText.trim()) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Build context block to prepend to the internal user message
      const contextPrefix = `<user_context>\nCurrent Hashrate: ${hashrate} TH/s\nFacility Tier: ${tier}\nUnclaimed Balance: ${balance} hCASH\nElectricity Rate: ${rate}\n</user_context>\n\nUser Question: `;
      const requestMessages = [
        ...messages,
        { role: "user", content: contextPrefix + messageText },
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: requestMessages }),
      });

      if (!res.ok) throw new Error("Terminal connection failed.");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6);
              if (dataStr === "[DONE]") continue;
              try {
                const data = JSON.parse(dataStr);
                if (data.type === "content_block_delta" && data.delta?.type === "text_delta") {
                  assistantText += data.delta.text;
                  setMessages((prev) => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].content = assistantText;
                    return newArr;
                  });
                }
              } catch {
                // Ignore parsing errors for partial chunks
              }
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "ERROR: COM-LINK SEVERED. CHECK API KEY IN .env.local OR NETWORK STATUS." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const exportChat = () => {
    const textBlob = messages.map(m => `[${m.role.toUpperCase()}]:\n${m.content}\n`).join("\n");

    const blob = new Blob([textBlob], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hashpilot-log.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] w-full max-w-7xl mx-auto">
      {/* LEFT CONTEXT PANEL 30% */}
      <div className="w-full lg:w-[30%] flex flex-col gap-6 h-full">
        <div className="bg-hp-surface border border-hp-border rounded-sm p-5 shadow-lg">
          <h2 className="font-sans font-bold tracking-widest text-[#00D4FF] mb-4 flex items-center gap-2 text-sm uppercase">
            <span className="w-2 h-2 bg-[#00D4FF] block animate-pulse"></span>
            YOUR SETUP
          </h2>
          
          <div className="space-y-4 font-mono text-sm">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-hp-text-muted tracking-widest block">HASHRATE (TH/s)</label>
              <input type="number" value={hashrate} onChange={(e) => setHashrate(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border p-2 focus:border-[#00D4FF] focus:outline-none text-hp-text-primary rounded-sm" />
            </div>
            <div className="flex flex-col gap-1">
               <label className="text-[10px] text-hp-text-muted tracking-widest block">FACILITY TIER</label>
               <select value={tier} onChange={(e) => setTier(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border p-2 focus:border-[#00D4FF] focus:outline-none text-hp-text-primary rounded-sm appearance-none">
                 <option value="STARTER">STARTER</option>
                 <option value="STANDARD">STANDARD</option>
                 <option value="ADVANCED">ADVANCED</option>
                 <option value="ELITE">ELITE</option>
               </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-hp-text-muted tracking-widest block">UNCLAIMED hCASH</label>
              <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border p-2 focus:border-[#00D4FF] focus:outline-none text-hp-text-primary rounded-sm" />
            </div>
            <div className="flex flex-col gap-1">
               <label className="text-[10px] text-hp-text-muted tracking-widest block">ELECTRICITY RATE</label>
               <select value={rate} onChange={(e) => setRate(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border p-2 focus:border-[#00D4FF] focus:outline-none text-hp-text-primary rounded-sm appearance-none">
                 <option value="NORMAL">NORMAL</option>
                 <option value="ELEVATED">ELEVATED</option>
                 <option value="SURGE">SURGE</option>
               </select>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-[100px] border border-hp-border bg-[rgba(5,8,16,0.6)] rounded-sm p-4 relative overflow-hidden flex items-center justify-center text-center">
           <AnimatePresence mode="wait">
             <motion.div
               key={tipIndex}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.5 }}
               className="font-mono text-xs text-hp-accent-blue"
             >
               {STARTER_TIPS[tipIndex]}
             </motion.div>
           </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setMessages([])} className="flex-1 bg-hp-surface border border-hp-border hover:bg-hp-accent-red/20 hover:text-hp-accent-red transition-colors text-hp-text-muted font-mono text-xs py-3 rounded-sm flex items-center justify-center gap-2">
            <Trash2 size={14} /> CLEAR
          </button>
          <button onClick={exportChat} className="flex-1 bg-hp-surface border border-hp-border hover:bg-hp-text-primary transition-colors text-hp-text-muted font-mono text-xs py-3 rounded-sm flex items-center justify-center gap-2">
            <Download size={14} /> EXPORT
          </button>
        </div>
      </div>

      {/* RIGHT CHAT WINDOW 70% */}
      <div className="flex-1 flex flex-col bg-[rgba(13,20,36,0.8)] backdrop-blur-md rounded-sm border border-hp-border overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="h-12 border-b border-hp-border bg-hp-surface flex items-center px-4 shrink-0">
          <Bot className="text-hp-accent-green mr-2" size={18} />
          <span className="font-sans text-xs tracking-widest text-hp-text-primary font-bold uppercase">SECURE CHANNEL // HASHPILOT AI</span>
        </div>

        {/* Chat Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full border border-hp-accent-green/30 flex items-center justify-center mb-6 bg-hp-accent-green/5 shadow-[0_0_30px_rgba(57,255,20,0.1)]">
                <Bot className="text-hp-accent-green animate-pulse" size={32} />
              </div>
              <h3 className="font-display text-xl text-hp-text-primary tracking-widest mb-2">SYSTEM READY</h3>
              <p className="font-mono text-sm text-hp-text-muted max-w-md mb-8">
                Context synchronization complete. Awaiting user prompt. Query about setup optimization, claiming strategies, or halving preparations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
                {[
                   "Should I claim right now?",
                   "My network hashrate doubled — what do I do?",
                   "How will the next halving affect my earnings?",
                   "Compare: Arc Miner vs Rig-X"
                ].map((q) => (
                  <button 
                    key={q} 
                    onClick={() => handleSend(q)}
                    className="border border-hp-border/50 bg-hp-surface hover:border-hp-accent-amber hover:text-hp-accent-amber text-left px-4 py-3 rounded-sm text-xs font-mono text-hp-text-secondary transition-all"
                  >
                    &quot;{q}&quot;
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                {m.role === "assistant" && (
                  <div className="text-[10px] font-mono tracking-widest text-hp-accent-green mb-1 ml-1 flex items-center gap-1.5 opacity-80">
                    ⬡ HASHPILOT AI
                  </div>
                )}
                <div className={cn(
                  "p-4 rounded-sm text-sm font-sans leading-relaxed whitespace-pre-wrap shadow-md transition-all",
                  m.role === "user" 
                    ? "bg-hp-accent-amber text-[#050810] font-medium" 
                    : "bg-hp-surface-elevated text-hp-text-primary border-l-4 border-hp-accent-green",
                  m.content.toLowerCase().includes("satoshi") && m.role === "assistant" && "border-4 border-hp-accent-amber shadow-[0_0_20px_rgba(245,166,35,0.4)]"
                )}>
                  {m.content}
                </div>
              </motion.div>
            ))
          )}
          {isTyping && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col max-w-[85%] mr-auto items-start">
               <div className="text-[10px] font-mono tracking-widest text-hp-accent-green mb-1 ml-1 flex items-center gap-1.5 opacity-80">
                  ⬡ HASHPILOT AI
                </div>
                <div className="bg-hp-surface-elevated border-l-4 border-hp-accent-green p-4 rounded-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-hp-accent-green rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-hp-accent-green rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-hp-accent-green rounded-full animate-bounce" />
                </div>
             </motion.div>
          )}
        </div>

        {/* Input Bar */}
        <div className="shrink-0 p-4 bg-hp-surface border-t border-hp-border">
          <div className="relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Transmit inquiry..."
              className="w-full bg-[#050810] border border-hp-border focus:border-hp-accent-amber focus:outline-none focus:shadow-[0_0_10px_rgba(245,166,35,0.2)] rounded-sm py-4 pl-4 pr-14 text-sm text-hp-text-primary font-mono resize-none transition-all placeholder:text-hp-text-muted"
              rows={1}
              style={{ overflow: 'hidden' }}
            />
            <button 
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-hp-accent-amber hover:bg-amber-400 text-black rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
