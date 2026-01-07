import React from "react";
import Welcome from './initial'
import BasicExample from "./login";
import { Routes,Route,Link, BrowserRouter } from "react-router-dom";

function App(){

  

  return(
    <BrowserRouter>
    <Routes>
         
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={< BasicExample/>} />
        {/* <Route path="/signup" element={<Welcome />} />
        <Route path="/" element={<Welcome />} /> */}
        
    </Routes>
  </BrowserRouter>
    
  )
}

export default App