import axios from "axios";

const api = axios.create({
  baseURL: "https://api.360messenger.com/v2", // ✅ FIXED
});

export default api;