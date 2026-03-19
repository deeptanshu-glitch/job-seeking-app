import React from "react";
import Welcome from './initial'
import Login from "./login";
import Signup from "./signup";
import Dash from "./dashboard";
import Profile from "./profile";
import Postjob from "./postjob";
import { Routes,Route, BrowserRouter } from "react-router-dom";
import ProtectedRoute from './ProtectedRoute';
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