import React from "react";
import { ShieldCheck, Database, FlaskConical, Globe } from "lucide-react";

export const TrustBar = () => {
  return (
    <>
      <div className="bg-slate-950 py-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-50 grayscale hover:grayscale-0 transition-all">
          <span className="text-white font-bold flex items-center gap-2">
            <Globe size={20} /> PubMed Central
          </span>
          <span className="text-white font-bold flex items-center gap-2">
            <Database size={20} /> OpenAlex API
          </span>
          <span className="text-white font-bold flex items-center gap-2">
            <FlaskConical size={20} /> ClinicalTrials.gov
          </span>
          <span className="text-white font-bold flex items-center gap-2">
            <ShieldCheck size={20} /> MERN Stack
          </span>
        </div>
      </div>
    </>
  );
};
