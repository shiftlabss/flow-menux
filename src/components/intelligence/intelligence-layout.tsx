"use client";

import { useState } from "react";
import { JarvisFullHeader } from "./jarvis-full-header";
import { IntelligenceContextPanel } from "./intelligence-context-panel";
import { JarvisFullConsole } from "./jarvis-full-console";
import { IntelligenceExecutionPanel } from "./intelligence-execution-panel";

export function IntelligenceLayout() {
  // Shared state for the layout could go here or in a store
  // For now, we engage the layout structure

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-zinc-50">
       {/* Header is sticky at the top of the content area */}
      <JarvisFullHeader />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Column A: Context & Selection */}
        <aside className="hidden w-[360px] flex-col border-r border-zinc-200 bg-white md:flex">
          <IntelligenceContextPanel />
        </aside>

        {/* Column B: Console & Chat */}
        <main className="flex flex-1 flex-col bg-slate-50 relative">
          <JarvisFullConsole />
        </main>

        {/* Column C: Execution Panel */}
        <aside className="hidden w-[380px] flex-col border-l border-zinc-200 bg-white xl:flex">
          <IntelligenceExecutionPanel />
        </aside>
      </div>
    </div>
  );
}
