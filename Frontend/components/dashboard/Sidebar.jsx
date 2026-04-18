import React from "react";
import { Plus, MessageSquare, Settings, X } from "lucide-react"; // Added X icon
import { useChat } from "../../context/HistoryContext";

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { chatHistory, loadSpecificChat, createNewChat, currentSessionId } =
    useChat();

  // Helper functions to auto-close the sidebar on mobile after making a selection
  const handleNewChat = () => {
    createNewChat();
    setIsOpen(false);
  };

  const handleSelectChat = (sessionId) => {
    loadSpecificChat(sessionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* ⚡ Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col h-full transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Mobile Header (Only shows on small screens) */}
        <div className="flex items-center justify-between p-4 md:hidden border-b border-slate-800">
          <span className="text-white font-bold tracking-wide">Curalink</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-3 md:pt-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-3 py-3 border border-slate-700 rounded-lg text-white hover:bg-slate-800 transition-colors text-sm mb-2"
          >
            <Plus size={16} /> New Research
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1.5 custom-scrollbar">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase px-3 mt-4 mb-3 tracking-wider">
            Recent Searches
          </h3>

          {chatHistory.length === 0 ? (
            <div className="text-slate-500 text-xs px-3 py-2 italic">
              No recent searches.
            </div>
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat.sessionId}
                onClick={() => handleSelectChat(chat.sessionId)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-sm truncate group transition-all duration-200 ${
                  currentSessionId === chat.sessionId
                    ? "bg-slate-800 text-emerald-400 font-medium"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
                title={chat.lastDiseaseContext || "General Chat"}
              >
                <MessageSquare
                  size={16}
                  className={`shrink-0 ${
                    currentSessionId === chat.sessionId
                      ? "text-emerald-500"
                      : "text-slate-500 group-hover:text-slate-400"
                  }`}
                />
                <span className="truncate capitalize">
                  {chat.lastDiseaseContext || "General Chat"}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-800 mt-auto bg-slate-900/50">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-inner shrink-0">
              SB
            </div>
            <span className="text-sm font-medium truncate">Suprodip B.</span>
            <Settings size={16} className="ml-auto text-slate-500 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};
