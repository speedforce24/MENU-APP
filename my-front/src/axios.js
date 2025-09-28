import axios from "axios";

// Create a single axios instance with a base URL
const api = axios.create({
  baseURL: "/api", // 👈 this will use vercel.json rewrites
});

export default api;
