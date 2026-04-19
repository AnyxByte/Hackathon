import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bot, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { useChat } from "../../context/HistoryContext";
import Header from "../../components/dashboard/Header";
import ChatMessage from "../../components/dashboard/ChatMessage";
import ChatInput from "../../components/dashboard/ChatInput";

const Dashboard = () => {
  const {
    messages,
    setMessages,
    currentSessionId,
    fetchChatHistory,
    setChatHistory,
    sharedChats,
  } = useChat();

  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const currentSharedChat = sharedChats?.find(
    (c) => c.sessionId === currentSessionId,
  );
  const isReadOnly = currentSharedChat?.myRole === "read";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText, resetForm) => {
    if (!queryText.trim()) return;
    const token = Cookies.get("token");

    const historyPayload = messages.map((msg) => ({
      role: msg.role,
      content:
        msg.type === "structured_report"
          ? msg.overview || msg.content
          : msg.content,
    }));

    const userMsg = { role: "user", content: queryText, type: "text" };
    setMessages((prev) => [...prev, userMsg]);
    resetForm();
    setIsLoading(true);

    if (messages.length === 0) {
      setChatHistory((prev) => [
        {
          sessionId: currentSessionId,
          lastDiseaseContext: "Extracting topic...",
        },
        ...prev,
      ]);
    }

    try {
      const response = await axios.post(
        `${apiUrl}/v1/query`,
        {
          query: queryText,
          conversationHistory: historyPayload,
          sessionId: currentSessionId,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessages((prev) => [...prev, response.data]);

      if (messages.length === 0) {
        await fetchChatHistory();
      }
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
    <div className="flex h-screen bg-[#F9FAFB] text-slate-900 font-sans overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden w-full">
        <Header isLoading={isLoading} setIsSidebarOpen={setIsSidebarOpen} />

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto pt-4 md:pt-8 pb-40">
          <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-8 md:space-y-12">
            {messages.length === 0 && (
              <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-4 px-4">
                <div className="p-4 bg-emerald-50 rounded-full text-emerald-600">
                  <Bot size={40} />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-slate-800">
                  How can I assist your research?
                </h2>
                <p className="text-slate-500 max-w-sm text-xs md:text-sm">
                  Ask about clinical trials, latest publications, or specific
                  disease treatments.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <ChatMessage key={idx} msg={msg} />
            ))}

            {isLoading && (
              <div className="flex gap-3 md:gap-6">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Loader2 size={18} className="animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 p-4 md:p-5 rounded-2xl shadow-sm">
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-300 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* Input Form */}
        {!isReadOnly ? (
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        ) : (
          <div className="flex items-center justify-center gap-2 py-4 bg-slate-200/50 backdrop-blur-md border border-slate-300 rounded-2xl text-slate-500 text-sm font-medium">
            You are viewing this research in read-only mode.
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
