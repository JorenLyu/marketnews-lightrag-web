import React, { useState } from 'react';
import { Input, Button, Select, Space, Checkbox, Spin } from 'antd';
import { SendOutlined, ClearOutlined } from '@ant-design/icons';
import { useAppContext } from '../../contexts/AppContext';
import { queryRAG } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [queryMode, setQueryMode] = useState('hybrid');
  const [onlyContext, setOnlyContext] = useState(false);
  const { addMessage, clearMessages, loading, setLoading } = useAppContext();

  const handleSubmit = async () => {
    if (!message.trim()) return;
    
    const userMessage = message.trim();
    addMessage(userMessage, true);
    setMessage('');
    setLoading(true);
    
    try {
      const response = await queryRAG(userMessage, queryMode, onlyContext);
      if (response.status === 'success') {
        addMessage(response.data || 'No response from the system');
      } else {
        addMessage(`Error: ${response.message || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Error during query:', error);
      addMessage(`Error: ${error.message || 'Failed to get response'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="input-container">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space align="center">
          <Select 
            value={queryMode} 
            onChange={setQueryMode}
            style={{ width: 120 }}
          >
            <Option value="naive">Naive</Option>
            <Option value="local">Local</Option>
            <Option value="global">Global</Option>
            <Option value="hybrid">Hybrid</Option>
          </Select>
          
          <Checkbox 
            checked={onlyContext}
            onChange={(e) => setOnlyContext(e.target.checked)}
          >
            Context Only
          </Checkbox>
          
          <Button 
            type="text" 
            icon={<ClearOutlined />} 
            onClick={clearMessages}
          >
            Clear
          </Button>
        </Space>
        
        <div style={{ display: 'flex' }}>
          <TextArea
            placeholder="Ask a question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <Button 
            type="primary" 
            icon={loading ? <Spin size="small" /> : <SendOutlined />} 
            onClick={handleSubmit}
            disabled={!message.trim() || loading}
            style={{ marginLeft: 8, height: 'auto' }}
          />
        </div>
      </Space>
    </div>
  );
};

export default ChatInput; 