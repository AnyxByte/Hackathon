import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { User, Bot, Send, MapPin, BookOpen, Loader2 } from "lucide-react";
import Cookies from "js-cookie";

import { Sidebar } from "../../components/dashboard/Sidebar";
import TrialCard from "../../components/dashboard/TrialCard";
import PublicationCard from "../../components/dashboard/Publication";

import { useChat } from "../../context/HistoryContext";

const Dashboard = () => {
  const { messages, setMessages, currentSessionId } = useChat();

  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const { register, handleSubmit, reset, watch } = useForm();
  const queryValue = watch("query");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const onSubmit = async (data) => {
    if (!data.query.trim()) return;
    const token = Cookies.get("token");

    const historyPayload = messages.map((msg) => ({
      role: msg.role,
      content:
        msg.type === "structured_report"
          ? msg.overview || msg.content
          : msg.content,
    }));

    // 2. Add User Message to UI
    const userMsg = { role: "user", content: data.query, type: "text" };
    setMessages((prev) => [...prev, userMsg]);
    reset();
    setIsLoading(true);

    console.log("data", {
      query: data.query,
      conversationHistory: historyPayload,
      sessionId: currentSessionId,
    });

    try {
      // 3. API Call
      const response = await axios.post(
        "http://localhost:3000/api/v1/query",
        {
          query: data.query,
          conversationHistory: historyPayload,
          sessionId: currentSessionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessages((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Curalink API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I encountered an error connecting to the research engine. Please try again.",
          type: "text",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-slate-900 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isLoading ? "bg-orange-400 animate-pulse" : "bg-emerald-500"}`}
            />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isLoading
                ? "Curalink is reasoning..."
                : "Curalink Engine Active"}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold border border-slate-200 flex items-center gap-1">
              <MapPin size={10} /> Toronto, CA
            </span>
          </div>
        </header>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto pt-8 pb-40">
          <div className="max-w-4xl mx-auto px-6 space-y-12">
            {messages.length === 0 && (
              <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-emerald-50 rounded-full text-emerald-600">
                  <Bot size={40} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  How can I assist your research?
                </h2>
                <p className="text-slate-500 max-w-sm text-sm">
                  Ask about clinical trials, latest publications, or specific
                  disease treatments.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-6 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                    msg.role === "assistant"
                      ? "bg-emerald-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot size={20} />
                  ) : (
                    <User size={20} />
                  )}
                </div>

                <div className="flex-1 space-y-6">
                  {msg.type === "structured_report" ? (
                    <div className="space-y-6">
                      <section className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <BookOpen size={16} className="text-emerald-600" />{" "}
                          Condition Overview
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-emerald-100 pl-4">
                          {/* ⚡ Handles both Live API (overview) and DB History (content) */}
                          "{msg.overview || msg.content}"
                        </p>
                      </section>

                      <section>
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                          Top Research Publications
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {msg.publications?.map((pub, i) => (
                            <PublicationCard key={i} pub={pub} />
                          ))}
                        </div>
                      </section>

                      {msg.trials && msg.trials.length > 0 && (
                        <section>
                          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
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
                    <div
                      className={`${msg.role === "user" ? "bg-emerald-50 border-emerald-100 ml-auto" : "bg-white border-slate-200"} border p-5 rounded-2xl text-slate-800 shadow-sm max-w-[90%]`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-6">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Loader2 size={20} className="animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* Input Form */}
        <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-slate-50 via-slate-50 to-transparent pb-6 pt-12">
          <div className="max-w-3xl mx-auto px-4">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 focus-within:ring-2 ring-emerald-500/20 transition-all flex items-center gap-2 px-2"
            >
              <input
                {...register("query")}
                type="text"
                autoComplete="off"
                className="flex-1 py-3 px-2 outline-none text-sm"
                placeholder="Ask about treatments, dosages, or trial eligibility..."
              />
              <button
                type="submit"
                disabled={isLoading || !queryValue}
                className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
