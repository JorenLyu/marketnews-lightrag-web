import React, { useState, useEffect } from 'react';
import { Card, Button, notification, Spin } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { generateGraph } from '../../services/api';

const KnowledgeGraph = () => {
  const [loading, setLoading] = useState(false);
  const [graphUrl, setGraphUrl] = useState('');

  const handleGenerateGraph = async () => {
    setLoading(true);
    
    try {
      const response = await generateGraph();
      if (response.status === 'success') {
        notification.success({
          message: 'Graph Generated',
          description: response.message || 'Knowledge graph has been generated successfully.',
          placement: 'topRight',
        });
        // Add a timestamp to force iframe refresh
        setGraphUrl(`${process.env.REACT_APP_API_URL || 'http://localhost:8020'}/show_graph?t=${Date.now()}`);
      } else {
        notification.error({
          message: 'Generation Failed',
          description: response.message || 'Failed to generate knowledge graph.',
          placement: 'topRight',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Generation Failed',
        description: error.message || 'An error occurred while generating the graph.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if the graph is already available
    setGraphUrl(`${process.env.REACT_APP_API_URL || 'http://localhost:8020'}/show_graph`);
  }, []);

  const handleDownloadHTML = () => {
    const downloadUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8020'}/download_graph`;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'knowledge_graph.html';
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    notification.success({
      message: 'Download Started',
      description: 'Knowledge graph HTML is being downloaded.',
      placement: 'topRight',
    });
  };

  return (
    <Card 
      title="Knowledge Graph Visualization" 
      className="site-layout-content"
      extra={
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            type="primary"
            icon={loading ? <Spin size="small" /> : <ReloadOutlined />}
            onClick={handleGenerateGraph}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Graph'}
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadHTML}
            disabled={loading}
          >
            Download HTML
          </Button>
        </div>
      }
    >
      <div className="knowledge-graph-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Spin size="large" tip="Generating knowledge graph..." />
          </div>
        ) : (
          <iframe
            src={graphUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Knowledge Graph"
            sandbox="allow-same-origin allow-scripts"
          />
        )}
      </div>
    </Card>
  );
};

export default KnowledgeGraph; 