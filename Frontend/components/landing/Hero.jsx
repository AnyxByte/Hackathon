import { ChevronRight, Zap } from "lucide-react";

function Hero() {
  return (
    <>
      <header className="relative pt-32 pb-20 bg-slate-900 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-20 left-[10%] w-72 h-72 bg-emerald-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 right-[10%] w-96 h-96 bg-indigo-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-sm mb-8 animate-fade-in">
            <Zap size={16} />
            <span>Hackathon Project: MERN + Open Source LLM</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Medical Research, <br />
            <span className="bg-linear-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
              Re-imagined by AI.
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Curalink is a reasoning-engine that connects patients and
            researchers to millions of publications and clinical trials through
            custom-tuned open-source models.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/40 group">
              Start Researching{" "}
              <ChevronRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button className="px-8 py-4 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-all">
              Read Documentation
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export default Hero;
