import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  // --- STATE ---
  const [chatHistory, setChatHistory] = useState([]); 
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const [currentSessionId, setCurrentSessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState([]);

  // --- ACTIONS ---

  // Fetch all history from MongoDB
  const fetchChatHistory = async () => {
    setIsHistoryLoading(true);
    try {
      // NOTE: Make sure to pass your JWT token in the headers here if your backend requires it!
      const response = await axios.get("http://localhost:3000/api/v1/fetchHistory", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}` // Adjust based on where you store your token
        }
      });

      // Sort chats so the newest ones appear at the top of the sidebar
      const sortedHistory = response.data.history.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      setChatHistory(sortedHistory);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Load history on initial mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Switch to an older chat from the Sidebar
  const loadSpecificChat = (sessionId) => {
    const selectedChat = chatHistory.find((chat) => chat.sessionId === sessionId);
    if (selectedChat) {
      setCurrentSessionId(selectedChat.sessionId);
      setMessages(selectedChat.messages);
    }
  };

  // Start a brand new chat
  const createNewChat = () => {
    setCurrentSessionId(crypto.randomUUID());
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
        chatHistory,
        isHistoryLoading,
        currentSessionId,
        setCurrentSessionId,
        messages,
        setMessages,
        fetchChatHistory,
        loadSpecificChat,
        createNewChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};