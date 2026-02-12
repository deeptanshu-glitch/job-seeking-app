 import React /*, { useEffect, useState, useRef }*/ from "react";
import { useNavigate } from "react-router-dom";
import "./postjob.css";
import API from "./api/auth";

function Postjob(){

   const navigate = useNavigate();

   const handleBack = () => {
        navigate(-1);
    }

    
    return(
        <div classname="post-container">
            <div classname="column column-left">
             <button onClick={handleBack} className="back-btn">← Back</button>
            <h3> Job Portal </h3>
            <ul className="sidebar-links">
                <li><button type="button" className="sidebar-link" >Overview</button></li>
            </ul>
        </div>   
            
            
        </div>
    )
}

export default Postjob