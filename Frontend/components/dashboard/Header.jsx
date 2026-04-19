import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  MapPin,
  MoreVertical,
  Download,
  Share2,
  Trash2,
} from "lucide-react";
import { useChat } from "../../context/HistoryContext";
import axios from "axios";
// import ShareModal from "./ShareModal";
import toast from "react-hot-toast";
import ShareModal from "./ShareModel";

const Header = ({ setIsSidebarOpen, isLoading }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const { currentSessionId, deleteChatHistory, myChats } = useChat();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const isOwner = myChats?.some((chat) => chat.sessionId === currentSessionId);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = () => {
    setIsMenuOpen(false);
    window.print();
  };

  const handleShare = () => {
    setIsMenuOpen(false);
    setIsShareModalOpen(true);
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    if (
      window.confirm("Are you sure you want to delete this research session?")
    ) {
      deleteChatHistory(currentSessionId);
    }
  };

  const executeShare = async (shareData) => {
    try {
      const payload = {
        sessionId: currentSessionId,
        targetUserId: shareData.targetUserId,
        role: shareData.role,
      };

      await axios.post(`${apiUrl}/v1/share`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success(`Successfully shared with ${shareData.emailToShareWith}`);
    } catch (error) {
      console.error("Failed to share:", error);
      toast.error("Failed to share chat.");
    }
  };

  return (
    <>
      <header className="h-14 border-b border-slate-200 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3">
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

        <div className="flex items-center gap-2 md:gap-3">
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold border border-slate-200 hidden sm:flex items-center gap-1">
            <MapPin size={10} /> {user?.location || "Unknown"}
          </span>

          {/* ⚡ ONLY render the 3-dots menu if the user is the OWNER */}
          {isOwner && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isMenuOpen
                    ? "bg-slate-200 text-slate-800"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <MoreVertical size={18} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                  <button
                    onClick={handleExport}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors"
                  >
                    <Download size={16} />
                    Export as PDF
                  </button>
                  <div className="h-px bg-slate-100 my-1 mx-2" />{" "}
                  {/* Divider */}
                  <button
                    onClick={handleShare}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors"
                  >
                    <Share2 size={16} />
                    Share Access
                  </button>
                  <div className="h-px bg-slate-100 my-1 mx-2" />{" "}
                  {/* Divider */}
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2.5 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete Chat
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={executeShare}
      />
    </>
  );
};

export default Header;
