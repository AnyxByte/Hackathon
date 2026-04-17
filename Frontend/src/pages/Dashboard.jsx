// import React, { useState } from 'react';
import {
  Search,
  History,
  BookOpen,
  Microscope,
  MapPin,
  ExternalLink,
  Activity,
  Info,
  Brain,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-slate-50 pt-16">
      {/* --- Left Sidebar: Context --- */}
      <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto p-6 hidden lg:block">
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Patient Profile
          </h3>
          <div className="p-4 bg-slate-900 rounded-2xl text-white">
            <p className="text-sm font-medium opacity-70">John Smith</p>
            <p className="text-lg font-bold">Parkinson's Disease</p>
            <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs">
              <MapPin size={12} /> Toronto, Canada
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Research History
          </h3>
          <div className="space-y-2">
            {[
              "Deep Brain Stimulation",
              "Vitamin D interaction",
              "Levodopa efficacy",
            ].map((q, i) => (
              <button
                key={i}
                className="w-full text-left p-3 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <History size={14} /> {q}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* --- Main Chat/Reasoning Area --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* AI Response Example */}
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Microscope size={20} />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Deep Brain Stimulation (DBS) Insights
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600">
                  <p>
                    Based on 124 studies retrieved, DBS shows a{" "}
                    <strong>60% reduction</strong> in motor fluctuations in
                    patients with Parkinson's. In Toronto, 3 active Phase III
                    trials are evaluating new electrode placements...
                  </p>
                </div>

                {/* Thinking/Pipeline Visualization */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-6 overflow-x-auto">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-white px-3 py-2 rounded-lg border border-emerald-100 whitespace-nowrap">
                    <Search size={14} /> Expanded Query
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-white px-3 py-2 rounded-lg border border-blue-100 whitespace-nowrap">
                    <Activity size={14} /> 300+ Sources Scanned
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-white px-3 py-2 rounded-lg border border-indigo-100 whitespace-nowrap">
                    <Brain size={14} /> Reasoning Complete
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-slate-200">
          <div className="max-w-3xl mx-auto relative">
            <input
              type="text"
              placeholder="Ask about treatments, trials, or researchers..."
              className="w-full pl-6 pr-16 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 transition-all">
              <Search size={20} />
            </button>
          </div>
        </div>
      </main>

      {/* --- Right Sidebar: Sources --- */}
      <aside className="w-96 bg-slate-50 border-l border-slate-200 overflow-y-auto p-6 hidden xl:block">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Cited Research & Trials
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                  Publication
                </span>
                <ExternalLink
                  size={14}
                  className="text-slate-300 group-hover:text-emerald-500 cursor-pointer"
                />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                Long-term Efficacy of Subthalamic Nucleus Stimulation
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Lim et al. • 2024 • PubMed
              </p>
              <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 italic bg-slate-50 p-2 rounded-lg">
                <Info size={10} /> "...DBS improved motor function scores by
                12.4 points compared to baseline..."
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default Dashboard;
