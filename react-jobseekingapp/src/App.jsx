import React from "react";
import Welcome from './initial'
import Login from "./login";
import { Routes,Route,Link, BrowserRouter } from "react-router-dom";

function App(){

  

  return(
    <BrowserRouter>
    <Routes>
         
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={< Login />} />
        
        
    </Routes>
  </BrowserRouter>
    
  )
}

export default App