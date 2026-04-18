import React from "react";
import { User, Bot, BookOpen } from "lucide-react";
import PublicationCard from "./Publication";
import TrialCard from "./TrialCard";

const ChatMessage = ({ msg }) => {
  const isAssistant = msg.role === "assistant";

  return (
    <div
      className={`flex gap-3 md:gap-6 ${!isAssistant ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
          isAssistant
            ? "bg-emerald-600 text-white"
            : "bg-white border border-slate-200 text-slate-600"
        }`}
      >
        {isAssistant ? <Bot size={18} /> : <User size={18} />}
      </div>

      <div className="flex-1 space-y-6 max-w-[85%] md:max-w-full">
        {msg.type === "structured_report" ? (
          <div className="space-y-4 md:space-y-6">
            <section className="bg-white border border-slate-200 p-4 md:p-6 rounded-2xl shadow-sm">
              <h3 className="text-xs md:text-sm font-bold text-slate-900 mb-2 md:mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-600" /> Condition
                Overview
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed italic border-l-2 border-emerald-100 pl-3 md:pl-4">
                "{msg.overview || msg.content}"
              </p>
            </section>

            {msg.publications && msg.publications.length > 0 && (
              <section>
                <h3 className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                  Top Research Publications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {msg.publications.map((pub, i) => (
                    <PublicationCard key={i} pub={pub} />
                  ))}
                </div>
              </section>
            )}

            {msg.trials && msg.trials.length > 0 && (
              <section>
                <h3 className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                  Relevant Clinical Trials
                </h3>
                <div className="space-y-3">
                  {msg.trials.map((trial, i) => (
                    <TrialCard key={i} trial={trial} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="bg-emerald-50 border-emerald-100 border p-3 md:p-5 rounded-2xl text-slate-800 shadow-sm inline-block">
            <p className="text-xs md:text-sm leading-relaxed">{msg.content}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
