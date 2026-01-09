import React from "react";
import Welcome from './initial'
import Login from "./login";
import Signup from "./signup";
import { Routes,Route, BrowserRouter } from "react-router-dom";

function App(){

  

  return(
    <BrowserRouter>
    <Routes>
         
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={< Login />} />
        <Route path="/signup" element={< Signup />} />
        
        
    </Routes>
  </BrowserRouter>
    
  )
}

export default App