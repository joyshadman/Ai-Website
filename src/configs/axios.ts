import axios from 'axios';
import { getApiBaseUrl } from '@/config/env';

const baseURL = getApiBaseUrl();

const api = axios.create({
  ...(baseURL ? { baseURL } : {}),
  withCredentials: true,
});

export default api;
