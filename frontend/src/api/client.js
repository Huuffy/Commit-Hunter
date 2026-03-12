import axios from "axios";

const API_BASE_URL = import.meta.env.PROD
  ? "https://coherence-26-1.onrender.com"
  : "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { API_BASE_URL };
export default apiClient;
