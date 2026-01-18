import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api;"

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

export const authAPI ={
    login:(credentials) => api.post("/auth", credentials),
    forgotPassword:(email)=>api.post("/forgot-password",{email}),
    resetPassword:(token,password) => api.post(`/reset-password/${token}`, {password}),
    getProfile:() =>api.get("/auth/profile")
};

export const userAPI ={
    getAllUsers:()=> api.get("/users")
}

export default axiosInstance;