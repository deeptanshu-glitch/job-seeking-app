import React from "react";
import Welcome from './initial'
import Login from "./login";
import Signup from "./signup";
import Dash from "./dashboard";
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