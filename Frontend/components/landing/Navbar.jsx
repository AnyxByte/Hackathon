import React from "react";
import { Brain, Menu, X } from "lucide-react";
import { Link } from "react-router";

function Navbar({ isMenuOpen, setIsMenuOpen }) {
  return (
    <>
      <nav className="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <Brain className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Cura<span className="text-emerald-500">link</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-slate-300 font-medium">
              <a
                href="#pipeline"
                className="hover:text-emerald-400 transition-colors"
              >
                How it Works
              </a>
              <Link to="/auth">
                <button className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-full transition-all shadow-lg shadow-emerald-900/20">
                  Launch App
                </button>
              </Link>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white"
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
