import React from 'react'
import { ArrowRight01Icon, Activity02Icon } from 'hugeicons-react'
import { Button } from '../ui/button'
import { motion } from 'framer-motion'

export const EditorialHero: React.FC = () => {
  const transition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }

  return (
    <section className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left: Typography & CTA (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-start z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="text-5xl md:text-7xl font-display font-medium leading-[1.05] tracking-tight text-slate-900 mb-8 mt-4"
          >
            Deteksi dini, <br className="hidden md:block" />
            tumbuh <span className="hl hl--teal">lebih pasti.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.08 }}
            className="text-lg md:text-xl text-slate-600 max-w-lg mb-10 leading-relaxed font-light"
          >
            Sistem edukasi holistik dan deteksi stunting terintegrasi. Pendekatan klinis berbasis standar WHO 2006 untuk masa depan anak Indonesia.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.12 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" className="rounded-full bg-[#1e293b] hover:bg-[#0f172a] text-white px-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2">
              Mulai Skrining <ArrowRight01Icon className="ml-2 w-4 h-4" />
            </Button>
            <Button variant="ghost" size="lg" className="rounded-full px-8 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2">
              Lihat Cara Kerja
            </Button>
          </motion.div>
        </div>

        {/* Right: Asymmetric Product Visualization (5 cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.2 }}
          className="lg:col-span-5 relative mt-12 lg:mt-0"
        >
          <div className="relative w-full aspect-square md:aspect-[4/5] bg-[var(--color-paper-2)] border border-slate-200/50 p-6 flex flex-col rounded-2xl">
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200/60">
              <span className="font-mono text-xs uppercase tracking-widest text-slate-500">WHO Growth Chart</span>
              <div className="flex items-center gap-2 text-emerald-700 font-mono text-xs font-semibold bg-emerald-100/50 px-2.5 py-1 rounded-full border border-emerald-200/50">
                <Activity02Icon className="w-3.5 h-3.5" />
                <span>Normal</span>
              </div>
            </div>

            {/* High Fidelity Chart Abstraction */}
            <div className="flex-1 relative flex flex-col pt-2 pb-6 px-2">
              
              {/* Y-axis Labels */}
              <div className="absolute left-0 top-2 bottom-6 flex flex-col justify-between text-[9px] font-mono text-slate-400 tabular-nums">
                <span>+3</span>
                <span>+2</span>
                <span> 0</span>
                <span>-2</span>
                <span>-3</span>
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-0 left-6 bottom-6 flex flex-col justify-between z-0">
                <div className="border-t border-slate-200/60 w-full"></div>
                <div className="border-t border-slate-300/60 border-dashed w-full"></div>
                <div className="border-t border-slate-400/50 w-full"></div>
                <div className="border-t border-red-300/50 border-dashed w-full"></div>
                <div className="border-t border-red-200/50 w-full"></div>
              </div>

              {/* X-axis Labels */}
              <div className="absolute bottom-0 left-6 right-0 flex justify-between text-[9px] font-mono text-slate-400 tabular-nums">
                <span>0mo</span>
                <span>6mo</span>
                <span>12mo</span>
                <span>18mo</span>
                <span>24mo</span>
              </div>

              {/* Chart Curves SVG */}
              <svg className="absolute inset-0 left-6 bottom-6 h-full w-[calc(100%-1.5rem)] z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* 0 SD Line (Green) */}
                <path d="M 0 50 Q 20 45 40 40 T 80 30 T 100 25" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                {/* -2 SD Line (Red warning) */}
                <path d="M 0 80 Q 20 75 40 70 T 80 65 T 100 62" fill="none" stroke="#fca5a5" strokeWidth="1" strokeDasharray="4 2" />
                {/* 2 SD Line (Top warning) */}
                <path d="M 0 20 Q 20 15 40 10 T 80 8 T 100 5" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 2" />
                
                {/* Actual Patient Data Curve */}
                <motion.path 
                  d="M 0 55 Q 15 50 25 55 T 45 45 T 70 35 T 100 32" 
                  fill="none" 
                  stroke="#0f172a" 
                  strokeWidth="2.5" 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                />
                
                {/* Data Points */}
                <motion.circle initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} cx="25" cy="55" r="2.5" fill="#0f172a" />
                <motion.circle initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} cx="45" cy="45" r="2.5" fill="#0f172a" />
                <motion.circle initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} cx="70" cy="35" r="2.5" fill="#0f172a" />
                <motion.circle initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} cx="100" cy="32" r="3" fill="#0ea5e9" className="animate-pulse" />
              </svg>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest">BB/U</span>
                <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">-0.2 SD</span>
              </div>
              <div className="border-l border-r border-slate-200/60">
                <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest">TB/U</span>
                <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">+0.5 SD</span>
              </div>
              <div>
                <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest">BB/TB</span>
                <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">0.0 SD</span>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </section>
  )
}
