import React from 'react';
import { Layout, Menu, Badge } from 'antd';
import {
  MessageOutlined,
  FileTextOutlined,
  UploadOutlined,
  ShareAltOutlined,
  StockOutlined,
  HeartOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = ({ selectedMenu, setSelectedMenu, healthStatus }) => {
  const menuItems = [
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: 'Chat'
    },
    {
      key: 'text',
      icon: <FileTextOutlined />,
      label: 'Insert Text'
    },
    {
      key: 'file',
      icon: <UploadOutlined />,
      label: 'Upload File'
    },
    {
      key: 'graph',
      icon: <ShareAltOutlined />,
      label: 'Knowledge Graph'
    },
    {
      key: 'news',
      icon: <StockOutlined />,
      label: 'Financial News'
    }
  ];

  const getHealthStatusColor = () => {
    switch (healthStatus) {
      case 'healthy':
        return 'green';
      case 'unhealthy':
        return 'red';
      default:
        return 'yellow';
    }
  };

  return (
    <Sider breakpoint="lg" collapsedWidth="0">
      <div className="logo" style={{ background: '#001529', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <span>LightRAG</span>
        <Badge 
          status={getHealthStatusColor()} 
          style={{ marginLeft: 8 }}
          title={`Backend status: ${healthStatus}`}
        />
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedMenu]}
        items={menuItems}
        onClick={e => setSelectedMenu(e.key)}
      />
      <div style={{ position: 'absolute', bottom: 16, width: '100%', textAlign: 'center' }}>
        <Badge 
          count={<HeartOutlined style={{ color: '#f5222d' }} />} 
          title="Backend Health"
        />
        <span style={{ color: 'white', marginLeft: 8, fontWeight: 'bold' }}>
          {healthStatus === 'checking' ? 'Checking...' : healthStatus}
          <span style={{ marginLeft: 5, display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: getHealthStatusColor() }}></span>
        </span>
      </div>
    </Sider>
  );
};

export default Sidebar; 