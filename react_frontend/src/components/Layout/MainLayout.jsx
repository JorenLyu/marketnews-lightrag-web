import React, { useState, useEffect } from 'react';
import { Layout, notification } from 'antd';
import Sidebar from './Sidebar';
import ChatBox from '../Chat/ChatBox';
import TextInput from '../Knowledge/TextInput';
import FileUpload from '../Knowledge/FileUpload';
import KnowledgeGraph from '../Graph/KnowledgeGraph';
import NewsScraper from '../News/NewsScraper';
import { checkHealth } from '../../services/api';

const { Content, Footer } = Layout;

const MainLayout = () => {
  const [selectedMenu, setSelectedMenu] = useState('chat');
  const [healthStatus, setHealthStatus] = useState('checking');

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const result = await checkHealth();
        setHealthStatus(result.status === 'healthy' ? 'healthy' : 'unhealthy');
        if (result.status === 'healthy') {
          notification.success({
            message: 'Connected to LightRAG',
            description: 'Successfully connected to the backend service.',
            placement: 'topRight',
          });
        }
      } catch (error) {
        setHealthStatus('unhealthy');
        notification.error({
          message: 'Connection Failed',
          description: 'Could not connect to the LightRAG backend service.',
          placement: 'topRight',
        });
      }
    };

    checkBackendHealth();
  }, []);

  const renderContent = () => {
    switch (selectedMenu) {
      case 'chat':
        return <ChatBox />;
      case 'text':
        return <TextInput />;
      case 'file':
        return <FileUpload />;
      case 'graph':
        return <KnowledgeGraph />;
      case 'news':
        return <NewsScraper />;
      default:
        return <ChatBox />;
    }
  };

  return (
    <Layout className="app-container">
      <Sidebar selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} healthStatus={healthStatus} />
      <Layout>
        <Content className="site-layout-content">
          {renderContent()}
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          LightRAG Frontend ©{new Date().getFullYear()} Created with Ant Design
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 