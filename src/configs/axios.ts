import axios from 'axios';

const apiBaseURL =
  import.meta.env.VITE_BASE_URL?.trim() ||
  import.meta.env.VITE_BASEURL?.trim() ||
  '';

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

export default api;