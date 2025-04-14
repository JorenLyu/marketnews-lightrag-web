import React from 'react';
import { ConfigProvider } from 'antd';
import MainLayout from './components/Layout/MainLayout';
import { AppProvider } from './contexts/AppContext';
import './App.css';

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1890ff' } }}>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ConfigProvider>
  );
}

export default App;
