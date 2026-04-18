import React from "react";
import { Plus, MessageSquare, Settings } from "lucide-react";
import { useChat } from "../../context/HistoryContext";

export const Sidebar = () => {
  // ⚡ Pull dynamic state and functions from Context
  const { chatHistory, loadSpecificChat, createNewChat, currentSessionId } =
    useChat();

  return (
    <>
      <aside className="w-65 bg-slate-900 flex flex-col h-full md:flex">
        <div className="p-3">
          {/* ⚡ Fire createNewChat when clicked */}
          <button
            onClick={createNewChat}
            className="w-full flex items-center gap-3 px-3 py-3 border border-slate-700 rounded-lg text-white hover:bg-slate-800 transition-colors text-sm mb-4"
          >
            <Plus size={16} /> New Research
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-2">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase px-3 mt-4 mb-2">
            Recent Searches
          </h3>

          {/* ⚡ Dynamically map over chatHistory from MongoDB */}
          {chatHistory.length === 0 ? (
            <div className="text-slate-500 text-xs px-3 py-2 italic">
              No recent searches.
            </div>
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat.sessionId}
                onClick={() => loadSpecificChat(chat.sessionId)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-sm truncate group transition-colors ${
                  currentSessionId === chat.sessionId
                    ? "bg-slate-800 text-emerald-400" // Active styling
                    : "text-slate-300 hover:bg-slate-800" // Inactive styling
                }`}
                title={chat.lastDiseaseContext || "General Chat"}
              >
                <MessageSquare
                  size={16}
                  className={
                    currentSessionId === chat.sessionId
                      ? "text-emerald-500"
                      : "text-slate-500"
                  }
                />
                <span className="truncate capitalize">
                  {/* Uses the disease context you saved in MongoDB as the title */}
                  {chat.lastDiseaseContext || "General Chat"}
                </span>
              </div>
            ))
          )}
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
