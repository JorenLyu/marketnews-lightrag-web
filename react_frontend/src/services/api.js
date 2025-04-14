import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8020';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Query the RAG system
export const queryRAG = async (query, mode = 'hybrid', only_need_context = false) => {
  try {
    const response = await fetch(`${API_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        mode: mode,
        only_need_context: only_need_context
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Insert text into the RAG system
export const insertText = async (text) => {
  try {
    const response = await api.post('/insert', { text });
    return response.data;
  } catch (error) {
    console.error('Error inserting text:', error);
    throw error;
  }
};

// Upload file to the RAG system
export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/insert_file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Generate knowledge graph
export const generateGraph = async () => {
  try {
    const response = await api.get('/generate_graph');
    return response.data;
  } catch (error) {
    console.error('Error generating graph:', error);
    throw error;
  }
};

// Check backend health
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
};

// Scrape financial news
export const scrapeNews = async (ticker, newsCount = 10) => {
  try {
    const response = await api.post('/scrape_news', {
      ticker,
      news_count: newsCount
    });
    return response.data;
  } catch (error) {
    console.error('Error scraping news:', error);
    throw error;
  }
}; 