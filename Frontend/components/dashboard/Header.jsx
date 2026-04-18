import React from "react";
import { Menu, MapPin } from "lucide-react";

const Header = ({ setIsSidebarOpen, isLoading }) => {
  return (
    <header className="h-14 border-b border-slate-200 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md z-20">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu (Visible only on mobile) */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isLoading ? "bg-orange-400 animate-pulse" : "bg-emerald-500"
            }`}
          />
          <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isLoading ? "Reasoning..." : "Engine Active"}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold border border-slate-200 hidden sm:flex items-center gap-1">
          <MapPin size={10} /> Toronto, CA //change
        </span>
      </div>
    </header>
  );
};

export default Header;