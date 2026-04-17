import React from "react";
import { Brain } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-1 rounded">
            <Brain size={20} />
          </div>
          <span className="font-bold tracking-tight">Curalink</span>
        </div>
        <div className="flex gap-8 text-slate-400 text-sm">
          <a href="#" className="hover:text-white">
            API Documentation
          </a>
          <a href="#" className="hover:text-white">
            Terms
          </a>
          <a href="#" className="hover:text-white">
            Privacy
          </a>
        </div>
        <div className="text-slate-500 text-xs text-center">
          © 2026 Curalink AI. Hackathon Prototype. Built for Medical
          Advancement.
        </div>
      </div>
    </footer>
  );
};
