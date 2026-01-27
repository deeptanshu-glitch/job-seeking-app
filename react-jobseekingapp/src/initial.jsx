import React from "react";
import './initial.css'
import Login from "./login";
import { Link } from "react-router-dom";


function Welcome(){

    return(
        <div className="intro-bg">
        <div className="intro-bg">
            <h1 className="dropBounce heading m-2 m-sm-3 m-md-4 m-lg-5 delay-0"><br /><br />JOB SEEKER<br /><br /></h1>
            <h4 className="dropBounce Quotes delay-1"><br /><br /> Less stress,<br /></h4>
            <h4 className="dropBounce Quotes delay-2"> Better opportunities, <br /></h4>
            <h4 className="dropBounce Quotes delay-3">Smarter career decisions<br /><br /> </h4>
            <h4 className="dropBounce Motivation delay-4">-All in one Go</h4>



            <div className="button-container" style={
                {paddingRight: '20%',
                paddingTop: '5%'}}>
              <Link to="/login"><button className="btn login-btn fade-in delay-5 pulse-glow " onClick={Login} style={{color:'white'}}>Login</button></Link>
              <Link to="/signup"><button className="btn signup-btn fade-in delay-5 pulse-glow "style={{color:'white'}}>Sign Up</button></Link> 
            </div>

        </div>
    </div>
    )
}

export default Welcome