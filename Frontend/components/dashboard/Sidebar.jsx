import React from "react";
import { Plus, MessageSquare, Settings } from "lucide-react";

export const Sidebar = () => {
  return (
    <>
      <aside className="w-65 bg-slate-900 flex flex-col h-full  md:flex">
        <div className="p-3">
          <button className="w-full flex items-center gap-3 px-3 py-3 border border-slate-700 rounded-lg text-white hover:bg-slate-800 transition-colors text-sm mb-4">
            <Plus size={16} /> New Research
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-2">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase px-3 mt-4 mb-2">
            Recent Searches
          </h3>
          {[
            "DBS Efficacy 2024",
            "Toronto Clinical Trials",
            "Levodopa Side Effects",
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-slate-800 cursor-pointer text-sm truncate group"
            >
              <MessageSquare size={16} className="text-slate-500" />
              {item}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-slate-800 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
              SB
            </div>
            <span className="text-sm">Suprodip B.</span>
            <Settings size={16} className="ml-auto text-slate-500" />
          </div>
        </div>
      </aside>
    </>
  );
};
