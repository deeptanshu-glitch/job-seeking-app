import React from "react";
import Welcome from './pages/Home/Home'
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Dash from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Postjob from "./pages/PostJob/PostJob";
import { Routes,Route, BrowserRouter } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
function App(){

  

  return(
    <BrowserRouter>
    <Routes>
         
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={< Login />} />
        <Route path="/signup" element={< Signup />} />
        <Route 
            path="/profile" 
            element={
               <ProtectedRoute>
                    <Profile /> 
               </ProtectedRoute>
            }
        />

        <Route 
            path="/post" 
            element={
               <ProtectedRoute>
                    <Postjob /> 
               </ProtectedRoute>
            }
        />
        
        <Route 
            path="/dashboard"
            element ={
               <ProtectedRoute>
                    <Dash /> 
               </ProtectedRoute>
            }
        />   
        
        
    </Routes>
  </BrowserRouter>
    
  )
}

export default App