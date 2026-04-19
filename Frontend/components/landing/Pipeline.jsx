import React from "react";
import { Brain, Database, Zap, BarChart3 } from "lucide-react";

export const Pipeline = () => {
  return (
    <section id="pipeline" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
            The Curalink Reasoning Engine
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            A fault-tolerant, hallucination-free RAG pipeline built to turn raw medical data into actionable insights.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>

          {[
            {
              step: "01",
              title: "NLP Query Extraction",
              desc: "Llama-3-8B performs strict zero-shot extraction, isolating the precise disease and research intent from natural language.",
              icon: <Zap className="w-6 h-6" />,
              color: "hover:border-emerald-500",
            },
            {
              step: "02",
              title: "Fault-Tolerant Fetch",
              desc: "Parallel, resilient API fetching from PubMed, OpenAlex, and ClinicalTrials.gov ensures uptime even if a database drops.",
              icon: <Database className="w-6 h-6" />,
              color: "hover:border-blue-500",
            },
            {
              step: "03",
              title: "BM25-Style Ranking",
              desc: "Custom algorithmic scoring applies heavy multipliers to user intent keywords to surface the most relevant clinical data.",
              icon: <BarChart3 className="w-6 h-6" />,
              color: "hover:border-indigo-500",
            },
            {
              step: "04",
              title: "Guarded Synthesis",
              desc: "Cloud-hosted Llama-3 generates a cited overview with strict 'Anti-Hallucination' guardrails to explicitly admit missing data.",
              icon: <Brain className="w-6 h-6" />,
              color: "hover:border-purple-500",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative 
              transition-all duration-300 ease-out 
              hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50 
              cursor-default group ${item.color}`}
            >
              <div
                className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-5 
                  transition-all duration-300 group-hover:bg-emerald-100 group-hover:text-emerald-600 group-hover:scale-110"
              >
                {item.icon}
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest transition-colors group-hover:text-emerald-500">
                  Step {item.step}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3 leading-tight">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.desc}
              </p>

              <div className="absolute bottom-0 left-0 w-0 h-1 bg-linear-to-r from-emerald-400 to-emerald-600 transition-all duration-300 group-hover:w-full rounded-b-2xl"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};