import React, { useState } from 'react';
import { Card, Input, Button, notification, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { insertText } from '../../services/api';

const { TextArea } = Input;

const TextInput = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInsert = async () => {
    if (!text.trim()) {
      notification.warning({
        message: 'Empty Text',
        description: 'Please enter some text to insert.',
        placement: 'topRight',
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await insertText(text);
      if (response.status === 'success') {
        notification.success({
          message: 'Text Inserted',
          description: 'Your text has been successfully added to the knowledge base.',
          placement: 'topRight',
        });
        setText('');
      } else {
        notification.error({
          message: 'Insertion Failed',
          description: response.message || 'Failed to insert text.',
          placement: 'topRight',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Insertion Failed',
        description: error.message || 'An error occurred while inserting text.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Insert Text to Knowledge Base" className="site-layout-content">
      <TextArea
        placeholder="Enter text to add to the knowledge base..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoSize={{ minRows: 10, maxRows: 20 }}
        style={{ marginBottom: 16 }}
        disabled={loading}
      />
      
      <Button
        type="primary"
        onClick={handleInsert}
        disabled={!text.trim() || loading}
        icon={loading ? <Spin size="small" /> : <SaveOutlined />}
      >
        {loading ? 'Inserting...' : 'Insert Text'}
      </Button>
    </Card>
  );
};

export default TextInput; 