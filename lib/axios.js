import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 🔐 Attach token automatically
api.interceptors.request.use((config) => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
   const country = JSON.parse(localStorage.getItem("country"));

  if (country) {
    config.headers["x-country"] = country.id;
  }

  return config;
});

export default api;