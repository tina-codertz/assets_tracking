import React from 'react'
import { useAuth } from '../pages/context/AuthContext'
import { useNavigate } from 'react-router-dom';

export const  DashboardLayout = () => {
    const {user, logout} = useAuth();
    const navigate = useNavigate()

    const handleLogout=()=>{
        logout();
        navigate("/auth")
    };

    const getRoleBadgeClass=(role)=>{
        switch(role){
            case "admin" : return "role-admin";
            case "manager" : return "role-manager";
            case "agent" : return "role-agent";
            default:return "";
    }
    }
    
    return (
    <div>DashboardLayout</div>
  )
};
  

