import axios, { AxiosInstance } from "axios";
import { TWITCH_CLIENT_ID } from "@/main";
import store from "@/store";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

const getToken = (): string | null => {
  return store.getters["userOauthToken"];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (!token) {
      throw new Error("User token not found.");
    }
    config.headers.common["Authorization"] = `Bearer ${token}`;
    config.headers.common["Client-Id"] = TWITCH_CLIENT_ID ?? "";
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
