import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/"

const axiosInstance = axios.create({
    baseURL:API_BASE_URL,
    headers:{
        "Content-Type":"application/json",
    }
});

//requesting an interceptor to add token
axiosInstance.interceptors.request.use(
    (config)=>{
        const token =localStorage.getItem("token");
        if (token){
            config.headers.Authorization=`Bearer ${token}`;
        }
        return config;

    },
    (error)=>{
        return Promise.reject(error);
    }
);

//Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    (response)=>response,
    (error) => {
        if(error.response?.status===401){
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href="/auth"

        }
        return Promise.reject(error);

    }
);

export const authAPI = {
  login: (credentials) => axiosInstance.post("/auth/login", credentials),
  forgotPassword: (email) => axiosInstance.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    axiosInstance.post(`/auth/reset-password/${token}`, { password }),
  getProfile: () => axiosInstance.get("/auth/profile"),
};

export const userAPI = {
  getAllUsers: () => axiosInstance.get("/users"),
  getCurrentUser: () => axiosInstance.get("/auth/profile"),
};

export const assetAPI = {
  list: () => axiosInstance.get("/assets"),
  create: (payload) => axiosInstance.post("/assets", payload),
  update: (id, payload) => axiosInstance.put(`/assets/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/assets/${id}`),
};

export const customerAPI = {
  list: () => axiosInstance.get("/customers"),
  create: (payload) => axiosInstance.post("/customers", payload),
};

export const contractAPI = {
  list: () => axiosInstance.get("/contracts"),
  create: (payload) => axiosInstance.post("/contracts", payload),
};

export const paymentAPI = {
  create: (payload) => axiosInstance.post("/payments", payload),
  list: () => axiosInstance.get("/payments"),
  listByContract: (contractId) => axiosInstance.get(`/payments/contract/${contractId}`),
};

export const reportAPI = {
  adminSummary: () => axiosInstance.get("/reports/admin/summary"),
  weeklyReturns: () => axiosInstance.get("/reports/weekly-returns"),
  monthlyReturns: () => axiosInstance.get("/reports/monthly-returns"),
  defaulters: () => axiosInstance.get("/reports/defaulters"),
  pnl: (params) => axiosInstance.get("/reports/pnl", { params }),
};


export default axiosInstance;