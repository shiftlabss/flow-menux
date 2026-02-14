"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { DashboardHeader } from "@/components/dashboard/header";
import { KpiSection } from "@/components/dashboard/kpi-section";
import { FunnelXRay } from "@/components/dashboard/funnel-x-ray";
import { CriticalAlerts, TodayActivities } from "@/components/dashboard/execution-section";
import { PipelineHealth, TeamPerformance } from "@/components/dashboard/performance-section";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50 } }
};

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-zinc-50/50 p-6 md:p-8 space-y-8">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-50/40 blur-[100px]" />
        <div className="absolute top-[10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-purple-50/40 blur-[100px]" />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-[1600px] space-y-8"
      >
        {/* Header */}
        <motion.div variants={item}>
          <DashboardHeader />
        </motion.div>

        {/* Faixa B: KPIs */}
        <motion.section variants={item}>
          <KpiSection />
        </motion.section>

        {/* Faixa C: Funnel X-Ray */}
        <motion.section variants={item}>
          <FunnelXRay />
        </motion.section>

        {/* Faixa D: Execução */}
        <motion.section variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
           {/* Left Column: Alerts & Activities (8 cols) */}
           <div className="lg:col-span-8 flex flex-col gap-6">
              <CriticalAlerts />
              <TodayActivities />
           </div>
           
           {/* Right Column: Health & Team (4 cols) */}
           <div className="lg:col-span-4 flex flex-col gap-6">
              <PipelineHealth />
              <TeamPerformance />
           </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
