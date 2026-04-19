import { MessageSquare } from "lucide-react";

export const ChatItem = ({ chat, isActive, onClick, isShared }) => {
  const activeTextColor = isShared ? "text-blue-400" : "text-emerald-400";
  const activeIconColor = isShared ? "text-blue-500" : "text-emerald-500";

  return (
    <div
      onClick={() => onClick(chat.sessionId)}
      className={`flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer text-sm group transition-all duration-200 ${
        isActive
          ? `bg-slate-800 ${activeTextColor} font-medium`
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      }`}
      title={chat.lastDiseaseContext || "General Chat"}
    >
      <div className="flex items-center gap-3 truncate flex-1">
        <MessageSquare
          size={16}
          className={`shrink-0 ${
            isActive
              ? activeIconColor
              : "text-slate-500 group-hover:text-slate-400"
          }`}
        />
        <span className="truncate capitalize flex-1">
          {chat.lastDiseaseContext || "General Chat"}
        </span>
      </div>
    </div>
  );
};
