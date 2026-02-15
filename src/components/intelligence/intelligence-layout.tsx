"use client";

import { motion } from "framer-motion";
import { JarvisFullHeader } from "./jarvis-full-header";
import { IntelligenceContextPanel } from "./intelligence-context-panel";
import { JarvisFullConsole } from "./jarvis-full-console";
import { IntelligenceExecutionPanel } from "./intelligence-execution-panel";
import { screenContainer } from "@/lib/motion";

export function IntelligenceLayout() {
  // Shared state for the layout could go here or in a store
  // For now, we engage the layout structure

  return (
    <motion.div
      variants={screenContainer}
      initial="hidden"
      animate="show"
      className="premium-ambient flex h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-[22px] border border-zinc-200/75 bg-white/70 shadow-[var(--shadow-premium-soft)] backdrop-blur-sm"
    >
       {/* Header is sticky at the top of the content area */}
      <JarvisFullHeader />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Column A: Context & Selection */}
        <aside className="hidden w-[360px] flex-col border-r border-zinc-200/70 bg-white/80 md:flex">
          <IntelligenceContextPanel />
        </aside>

        {/* Column B: Console & Chat */}
        <main className="relative flex flex-1 flex-col bg-linear-to-b from-slate-50 via-slate-50 to-slate-100/80">
          <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-brand/12 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-28 -right-24 h-56 w-56 rounded-full bg-cyan-400/10 blur-[100px]" />
          <JarvisFullConsole />
        </main>

        {/* Column C: Execution Panel */}
        <aside className="hidden w-[380px] flex-col border-l border-zinc-200/70 bg-white/80 xl:flex">
          <IntelligenceExecutionPanel />
        </aside>
      </div>
    </motion.div>
  );
}
