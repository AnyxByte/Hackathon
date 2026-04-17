import React from "react";
import { Brain, Database, Zap, BarChart3 } from "lucide-react";

export const Pipeline = () => {
  return (
    <>
      <section id="pipeline" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              The Curalink Reasoning Engine
            </h2>
            <p className="text-slate-600">
              How we turn raw data into life-saving insights.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>

            {[
              {
                step: "01",
                title: "Query Expansion",
                desc: "Our LLM analyzes user intent and expands terms (e.g., 'DBS' → 'Deep Brain Stimulation + Parkinson’s').",
                icon: <Zap />,
                color: "hover:border-emerald-500",
              },
              {
                step: "02",
                title: "Deep Retrieval",
                desc: "Batch fetching of 300+ records from OpenAlex, PubMed, and ClinicalTrials.gov.",
                icon: <Database />,
                color: "hover:border-blue-500",
              },
              {
                step: "03",
                title: "Intelligent Ranking",
                desc: "Cross-referencing relevance, recency, and credibility to extract the top 8 sources.",
                icon: <BarChart3 />,
                color: "hover:border-indigo-500",
              },
              {
                step: "04",
                title: "Structured Reasoning",
                desc: "Local LLM synthesizes a hallucination-free answer with verbatim source attribution.",
                icon: <Brain />,
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
                {/* Icon Container with group-hover effect */}
                <div
                  className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-4 
                    transition-colors duration-300 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                >
                  {item.icon}
                </div>

                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest transition-colors group-hover:text-emerald-500">
                  {item.step}
                </span>

                <h3 className="text-lg font-bold text-slate-900 mt-2 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>

                {/* Subtle bottom accent line that appears on hover */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-emerald-500 transition-all duration-300 group-hover:w-full rounded-b-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
