import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([]);
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

      setChatHistory(sortedHistory);
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
        setChatHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
