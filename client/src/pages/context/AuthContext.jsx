import React, { createContext, useContext, useState,useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null);

export const useAuth =()=>{
    const context = useContext(AuthContext);
    if (!context){
        throw new Error ("useAuth must be used within AuthProvider")
    }
    return context
}

export const AuthProvider = ({children}) =>{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token")

        if (storedUser && token){
            setUser(JSON.parse(storedUser));
        }
        setLoading(false)
    },[]);


const login = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });
    const { user, token } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);

    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Login failed",
    };
  }
};


const logout=()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href="/auth"
}

const forgotPassword = async (email)=>{
    try{
        await authAPI.forgotPassword(email);
        return{success:true};
    }catch(error){
        return{
            success:false,
        error:error.response?.data?.message || "failed to reset email"

        };
        
    }
};

const resetPassword = async (token,password)=>{
    try{
        await authAPI.resetPassword(token, password);
        return{success:true};

    }catch(error){
        return{
            success:false,
            error:error.response?.data?.message || "failed to reset password "
        }
    }
}

const value = {
    user,
    loading,
    login,
    logout,
    forgotPassword,
    resetPassword,
};

return(
    <AuthContext.Provider value={value}>
        {children}

    </AuthContext.Provider>
)
}