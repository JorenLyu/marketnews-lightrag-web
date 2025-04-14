import React from 'react';
import { Typography, Card, Space } from 'antd';
import ReactMarkdown from 'react-markdown';

const { Text } = Typography;

const ChatMessage = ({ message }) => {
  const { content, isUser, timestamp } = message;
  
  const formattedTime = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className={`message ${isUser ? 'user-message' : 'system-message'}`}>
      <Card
        size="small"
        bordered={false}
        style={{ 
          backgroundColor: isUser ? '#1890ff' : '#f0f2f5', 
          boxShadow: 'none',
          color: isUser ? 'white' : 'inherit'
        }}
      >
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          {isUser ? (
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{content}</Text>
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
          <Text type={isUser ? "secondary" : "secondary"} style={{ 
            fontSize: '11px', 
            textAlign: 'right',
            color: isUser ? 'rgba(255, 255, 255, 0.85)' : ''
          }}>
            {formattedTime}
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default ChatMessage; 