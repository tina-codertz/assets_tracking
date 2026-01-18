import React from 'react'
import {Navigate} from 'react-router-dom'
import { useAuth } from '../pages/context/AuthContext'

const ProtectedRoute = (children, allowedRoles=[]) => {
    const {user, loading } = useAuth();

    if (loading){
        return <div className='loading'>Loading..</div>
    }

    if(!user){
        return <Navigate to = "/login"/>
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)){
        return <Navigate to = "/dashboard"/>
    }
  return (
    <div>ProtectedRoute</div>
  )
}

export default ProtectedRoute