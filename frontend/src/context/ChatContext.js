import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { chatService } from '../services/chatService';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
      
      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket.emit('join-chat', user.id);
      });

      newSocket.on('new-message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  const createSession = async (documentId = null) => {
    if (!user) return;
    
    const session = await chatService.createSession(user.id, documentId);
    setCurrentSession(session);
    setMessages([]);
    return session;
  };

  const sendMessage = async (content, documentId = null) => {
    if (!currentSession) {
      await createSession(documentId);
    }

    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chatService.sendMessage({
        sessionId: currentSession.sessionId,
        message: content,
        documentId,
        userId: user.id
      });

      // Assistant message will be added via socket
      return response;
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
      throw error;
    }
  };

  const value = {
    messages,
    currentSession,
    isConnected,
    createSession,
    sendMessage,
    setMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
