import axios from "axios";

const api = axios.create({ baseURL:  "https://calmnest-server1-production.up.railway.app",});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const anonId = localStorage.getItem("anonymousId");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (anonId) config.headers["X-Anonymous-Id"] = anonId;
  return config;
});

export default api;
