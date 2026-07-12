import axios from "axios";

const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("myToken");

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData && config.headers) {
        delete config.headers["Content-Type"];
    }

    return config;
});

export default API;