import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [myChats, setMyChats] = useState([]);
  const [sharedChats, setSharedChats] = useState([]);

  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const [currentSessionId, setCurrentSessionId] = useState(() =>
    crypto.randomUUID(),
  );
  const [messages, setMessages] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchChatHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/v1/fetchHistory`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const sortedHistory = response.data.history.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      );

      // ⚡ Get the current user ID to determine ownership
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      // Depending on your auth, the ID might be _id or id
      const currentUserId = currentUser
        ? currentUser._id || currentUser.id
        : null;

      const owned = [];
      const shared = [];

      // ⚡ Segregate the chats and attach the specific role
      sortedHistory.forEach((chat) => {
        if (chat.userId === currentUserId) {
          owned.push(chat);
        } else {
          // Find my specific role in the sharedWith array
          const myShareInfo = chat.sharedWith.find(
            (s) => s.user === currentUserId,
          );

          shared.push({
            ...chat,
            myRole: myShareInfo ? myShareInfo.role : "read", // Default to read if something goes wrong
          });
        }
      });

      setChatHistory(sortedHistory); // Keep the flat array for quick searching
      setMyChats(owned);
      setSharedChats(shared);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const loadSpecificChat = (sessionId) => {
    const selectedChat = chatHistory.find(
      (chat) => chat.sessionId === sessionId,
    );
    if (selectedChat) {
      setCurrentSessionId(selectedChat.sessionId);
      setMessages(selectedChat.messages);
    }
  };

  const createNewChat = () => {
    setCurrentSessionId(crypto.randomUUID());
    setMessages([]);
  };

  const deleteChatHistory = async (sessionId) => {
    try {
      setChatHistory((prev) =>
        prev.filter((chat) => chat.sessionId !== sessionId),
      );
      setMyChats((prev) => prev.filter((chat) => chat.sessionId !== sessionId));
      setSharedChats((prev) =>
        prev.filter((chat) => chat.sessionId !== sessionId),
      );

      if (currentSessionId === sessionId) {
        createNewChat();
      }

      await axios.delete(`${apiUrl}/v1/delete/${sessionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success("Successfully deleted!");
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("Error deleting!");
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chatHistory,
        myChats,
        sharedChats,
        isHistoryLoading,
        currentSessionId,
        setCurrentSessionId,
        messages,
        setMessages,
        fetchChatHistory,
        loadSpecificChat,
        createNewChat,
        setChatHistory,
        deleteChatHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
