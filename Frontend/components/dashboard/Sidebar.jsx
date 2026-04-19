import React, { useState } from "react";
import { Plus, Settings, X } from "lucide-react";
import { useChat } from "../../context/HistoryContext";
import UserProfileModal from "./UserProfile";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import { ChatItem } from "./ChatItem";

const SidebarFooter = ({ user, onOpenProfile }) => (
  <div className="p-3 border-t border-slate-800 mt-auto bg-slate-900/50">
    <div
      onClick={onOpenProfile}
      className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors group"
    >
      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-inner shrink-0 uppercase">
        {user?.name ? user.name[0] : "U"}
      </div>
      <span className="text-sm font-medium truncate group-hover:text-white transition-colors">
        {user?.name?.split(" ")[0] || "Unknown"}
      </span>
      <Settings
        size={16}
        className="ml-auto text-slate-500 group-hover:text-slate-300 transition-colors shrink-0"
      />
    </div>
  </div>
);

const ChatSection = ({
  title,
  chats,
  currentSessionId,
  onSelect,
  isShared,
  emptyMessage,
}) => {
  if (!chats || chats.length === 0) {
    if (!emptyMessage) return null;
    return (
      <>
        <h3 className="text-[10px] font-bold text-slate-500 uppercase px-3 mt-4 mb-3 tracking-wider">
          {title}
        </h3>
        <div className="text-slate-500 text-xs px-3 py-2 italic">
          {emptyMessage}
        </div>
      </>
    );
  }

  return (
    <>
      <h3 className="text-[10px] font-bold text-slate-500 uppercase px-3 mt-6 mb-3 tracking-wider first:mt-4">
        {title}
      </h3>
      {chats.map((chat) => (
        <ChatItem
          key={chat.sessionId}
          chat={chat}
          isActive={currentSessionId === chat.sessionId}
          onClick={onSelect}
          isShared={isShared}
        />
      ))}
    </>
  );
};

// --- ⚡ 3. Main Sidebar Component ---
export const Sidebar = ({ isOpen, setIsOpen }) => {
  const {
    myChats,
    sharedChats,
    loadSpecificChat,
    createNewChat,
    currentSessionId,
  } = useChat();

  const user = JSON.parse(localStorage.getItem("user"));
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleNewChat = () => {
    createNewChat();
    setIsOpen(false);
  };

  const handleSelectChat = (sessionId) => {
    loadSpecificChat(sessionId);
    setIsOpen(false);
  };

  const handleSaveProfile = async (updatedData) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const data = {
      name: updatedData.firstName + " " + updatedData.lastName,
      location: updatedData.location,
    };

    try {
      const token = Cookies.get("token");
      const response = await axios.put(`${apiUrl}/auth/update`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem("user", JSON.stringify(response.data?.user));
      toast.success("Profile Updated!");
    } catch (error) {
      toast.error("Error Updating Profile!");
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col h-full transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
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
          <ChatSection
            title="My Searches"
            chats={myChats}
            currentSessionId={currentSessionId}
            onSelect={handleSelectChat}
            isShared={false}
            emptyMessage="No recent searches."
          />

          <ChatSection
            title="Shared With Me"
            chats={sharedChats}
            currentSessionId={currentSessionId}
            onSelect={handleSelectChat}
            isShared={true}
          />
        </div>

        <SidebarFooter
          user={user}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      </aside>

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
};
