import React, { useState } from 'react';
import { Card, Input, Button, InputNumber, notification, Spin, Typography, Modal } from 'antd';
import { SearchOutlined, CopyOutlined, CheckCircleFilled } from '@ant-design/icons';
import { scrapeNews } from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';

const { Search } = Input;
const { Title, Paragraph } = Typography;

const NewsScraper = () => {
  const [ticker, setTicker] = useState('');
  const [newsCount, setNewsCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const { newsContent, setNewsContent } = useAppContext();

  const handleScrape = async () => {
    if (!ticker.trim()) {
      notification.warning({
        message: 'Empty Ticker',
        description: 'Please enter a stock ticker symbol.',
        placement: 'topRight',
      });
      return;
    }

    setLoading(true);
    setNewsContent('');
    
    try {
      const response = await scrapeNews(ticker.trim(), newsCount);
      setNewsContent(response);
      notification.success({
        message: 'News Retrieved',
        description: `Successfully retrieved news for ${ticker.toUpperCase()}.`,
        placement: 'topRight',
      });
    } catch (error) {
      notification.error({
        message: 'Scraping Failed',
        description: error.message || 'Failed to retrieve news.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = async () => {
    if (!newsContent) return;
    
    setCopying(true);
    try {
      await navigator.clipboard.writeText(newsContent);
      
      // Show modal popup instead of message
      setShowCopyModal(true);
      
      // Auto close after 1.5 seconds
      setTimeout(() => {
        setShowCopyModal(false);
      }, 500);
      
      // Also show the notification
      notification.success({
        message: 'Copied to Clipboard',
        description: 'News content has been copied to your clipboard.',
        placement: 'topRight',
      });
    } catch (error) {
      notification.error({
        message: 'Copy Failed',
        description: 'Failed to copy to clipboard. Please try again.',
        placement: 'topRight',
      });
    } finally {
      setCopying(false);
    }
  };

  return (
    <Card title="Financial News Scraper" className="site-layout-content">
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Search
            placeholder="Enter stock ticker (e.g., AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            onSearch={handleScrape}
            enterButton={<Button icon={<SearchOutlined />}>Scrape</Button>}
            disabled={loading}
            style={{ marginRight: 16 }}
          />
          
          <InputNumber
            min={1}
            max={20}
            value={newsCount}
            onChange={setNewsCount}
            addonBefore="Articles"
            disabled={loading}
            style={{ width: 150 }}
          />
        </div>
        
        {loading && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <Spin size="large" tip={`Scraping news for ${ticker.toUpperCase()}...`} />
          </div>
        )}
        
        <div className="news-container">
          {newsContent ? (
            <Typography>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4}>News for {ticker.toUpperCase()}</Title>
                <Button 
                  type="primary" 
                  icon={<CopyOutlined />} 
                  onClick={copyToClipboard}
                  loading={copying}
                >
                  {copying ? 'Copying...' : 'Copy to Clipboard'}
                </Button>
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {newsContent}
              </pre>
            </Typography>
          ) : !loading && (
            <Paragraph type="secondary" style={{ textAlign: 'center', marginTop: 40 }}>
              Enter a stock ticker symbol and click "Scrape" to retrieve financial news.
            </Paragraph>
          )}
        </div>
      </div>
      
      {/* Copy Success Modal */}
      <Modal
        open={showCopyModal}
        footer={null}
        closable={false}
        centered
        maskClosable={true}
        width={300}
        bodyStyle={{ 
          padding: '30px', 
          textAlign: 'center',
          backgroundColor: '#f6ffed',
          borderRadius: '8px'
        }}
      >
        <div style={{ fontSize: '60px', color: '#52c41a', marginBottom: '16px' }}>
          <CheckCircleFilled />
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          Copied to Clipboard!
        </div>
      </Modal>
    </Card>
  );
};

export default NewsScraper; 