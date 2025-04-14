import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newsContent, setNewsContent] = useState('');

  const addMessage = (message, isUser = false) => {
    setChatMessages([...chatMessages, { content: message, isUser, timestamp: new Date() }]);
  };

  const clearMessages = () => {
    setChatMessages([]);
  };

  return (
    <AppContext.Provider
      value={{
        chatMessages,
        addMessage,
        clearMessages,
        loading,
        setLoading,
        newsContent,
        setNewsContent
      }}
    >
      {children}
    </AppContext.Provider>
  );
}; 