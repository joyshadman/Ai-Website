import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://ai-website-api.onrender.com",
  withCredentials: true,
});

export default api;
