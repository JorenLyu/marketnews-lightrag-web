import React, { useRef, useEffect } from 'react';
import { Card } from 'antd';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useAppContext } from '../../contexts/AppContext';

const ChatBox = () => {
  const { chatMessages } = useAppContext();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  return (
    <Card 
      title="Chat with LightRAG" 
      className="chat-container"
      bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div className="messages-container">
        {chatMessages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>
            <p>Ask a question about your documents!</p>
            <p>You can also upload new documents using the sidebar menu.</p>
          </div>
        )}
        
        {chatMessages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput />
    </Card>
  );
};

export default ChatBox; 