import React from "react";
import { Stethoscope, MapPin, ExternalLink, Activity } from "lucide-react";

const TrialCard = ({ trial }) => {
  const getStatusColor = (status) => {
    const s = status?.toUpperCase() || "";
    if (s.includes("RECRUITING") || s.includes("COMPLETED")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s.includes("TERMINATED") || s.includes("SUSPENDED")) return "bg-red-100 text-red-700 border-red-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 md:p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-50" />

      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 ml-1.5 md:ml-2">
        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">
          <Stethoscope size={12} className="text-emerald-600 md:w-3.5 md:h-3.5" />
          Clinical Trial
        </div>
        <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(trial.status)}`}>
          {trial.status || "UNKNOWN STATUS"}
        </span>
      </div>

      <h4 className="text-xs md:text-sm font-bold text-slate-900 mb-2 ml-1.5 md:ml-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
        {trial.title}
      </h4>

      <div className="flex flex-col gap-1.5 mb-2.5 ml-1.5 md:ml-2">
        {trial.location && trial.location !== "Not specified" && (
          <div className="flex items-start gap-1.5 text-[10px] md:text-xs text-slate-500">
            <MapPin size={12} className="shrink-0 mt-0.5 text-slate-400" />
            <span className="line-clamp-1">{trial.location}</span>
          </div>
        )}
        {trial.phase && (
          <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-slate-500">
            <Activity size={12} className="shrink-0 text-slate-400" />
            <span>{trial.phase}</span>
          </div>
        )}
      </div>

      <p className="text-[11px] md:text-xs text-slate-600 line-clamp-2 mb-3.5 ml-1.5 md:ml-2 leading-relaxed">
        {trial.abstract || "No summary available."}
      </p>

      <div className="ml-1.5 md:ml-2 mt-2">
        <a
          href={trial.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-[11px] md:text-xs font-bold transition-colors"
        >
          View Trial Registry <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};

export default TrialCard;