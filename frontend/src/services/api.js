import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Starting Request:', request.method, request.url);
  return request;
});

api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.log('Error Response:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 429) {
      // Create a proper rate limit error object
      const rateLimitError = new Error('Rate Limit Exceeded');
      rateLimitError.isRateLimit = true;
      rateLimitError.retryAfter = error.response.data.retry_after_seconds || 60;
      rateLimitError.response = error.response;
      rateLimitError.data = error.response.data;
      return Promise.reject(rateLimitError);
    }
    return Promise.reject(error);
  }
);

export const shortenUrl = async (url) => {
  try {
    const response = await api.post('/shortener', { url });
    return response.data;
  } catch (error) {
    console.error('Shorten URL error:', error);
    throw error;
  }
};

export const getAllUrls = async (skip = 0, limit = 20) => {
  const response = await api.get('/urls', { params: { skip, limit } });
  return response.data;
};

export const getUrlAnalytics = async (urlId) => {
  const response = await api.get(`/analytics/${urlId}`);
  return response.data;
};

export const accessShortUrl = async (alias) => {
    const response = await api.get(`/${alias}`);
    return response.data;
}

export default api;