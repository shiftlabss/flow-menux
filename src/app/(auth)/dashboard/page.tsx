"use client";

import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/header";
import { KpiSection } from "@/components/dashboard/kpi-section";
import { FunnelXRay } from "@/components/dashboard/funnel-x-ray";
import { CriticalAlerts, TodayActivities } from "@/components/dashboard/execution-section";
import { PipelineHealth, TeamPerformance } from "@/components/dashboard/performance-section";
import { screenContainer, sectionEnter } from "@/lib/motion";

export default function Dashboard() {
  return (
    <div className="premium-ambient min-h-screen p-6 md:p-8">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="premium-float absolute top-[-22%] left-[-12%] h-[560px] w-[560px] rounded-full bg-brand/15 blur-[120px]" />
        <div className="premium-float absolute top-[4%] right-[-8%] h-[420px] w-[420px] rounded-full bg-cyan-400/12 blur-[120px] [animation-delay:0.8s]" />
      </div>

      <motion.div 
        variants={screenContainer}
        initial="hidden"
        animate="show" 
        className="mx-auto max-w-[1600px] space-y-8"
      >
        {/* Header */}
        <motion.div variants={sectionEnter}>
          <DashboardHeader />
        </motion.div>

        {/* Faixa B: KPIs */}
        <motion.section variants={sectionEnter}>
          <KpiSection />
        </motion.section>

        {/* Faixa C: Funnel X-Ray */}
        <motion.section variants={sectionEnter}>
          <FunnelXRay />
        </motion.section>

        {/* Faixa D: Execução */}
        <motion.section variants={sectionEnter} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
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
