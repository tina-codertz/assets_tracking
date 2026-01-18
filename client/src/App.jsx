import React from 'react'
import { BrowserRouter as Router , Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './pages/context/AuthContext'
import { Toaster } from 'react-hot-toast'
import { Auth } from './components/Auth'
import ProtectedRoute from './components/ProtectedRoute'
import {DashboardLayout} from './components/DashboardLayout'
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import Manager from './pages/Dashboard/Manager'
import Agents from './pages/Dashboard/Agents'
import ForgotPassword from './components/ForgotPassword'

 const App = () => {
  const RenderDashboard = () =>{
    const user = JSON.parse(localStorage.getItem('user'));

    switch (user?.role){
      case "admin":
        return <AdminDashboard/>
      case "manager":
        return <Manager/>
      case "agent":
        return <Agents/>
      default:
        return <Navigate to="/auth"/>
    }
  }
  return (
  <Router>
    <AuthProvider>
      <Toaster position='top-right'/>
      <Routes>
        {/* public routes */}
        <Route path='/auth' element={<Auth/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>



       {/* protected routes */}
       <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout/>
        </ProtectedRoute>
       }>
        <Route index element={<RenderDashboard/>}/>
        <Route path="users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard/>
          </ProtectedRoute>
        }/>
        </Route>

        {/* default routes */}
        <Route path="/" element={<Navigate to ="/dashboard"/>}/>
        <Route path="*" element={<Navigate to ="/dashboard"/>}/>
     
      </Routes>

    </AuthProvider>
  </Router>
  )
}
export default App
