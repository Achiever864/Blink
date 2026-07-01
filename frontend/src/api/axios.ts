import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:4000/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("myToken");
    if(token && config.headers){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;