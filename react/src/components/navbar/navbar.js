import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
// import { AuthProvider, useAuth } from "../../contexts/AuthContext.js";

import "./navbar.css";

const Navbar = () => {
    //const navigate = useNavigate();
  //  const { userLoggedIn } = useAuth(); // Get the current userLoggedIn

    // Check login state from localStorage on component mount

    // Handle logout function
   // const handleLogout = () => {
    //    navigate("/login"); // Redirect to login page
   // };

    return (
        <nav className="nav">
            <a href="/" className="sitename">
                {/* Logo or website name */}
                <img src="" alt="logo" className="logo-image"/>
            </a>
            <div className="links">
                {/* Always visible links */}
                <a href="/" className="home">Home</a>
                <a href="/login" className="login">Login</a>

                {/* Conditional links based on login state */}
                {/*userLoggedIn ? (
                    <>
                        <a href="/profile" className="profile">Profile</a>
                    </>
                ) : (
                    <>
                        <a href="/login" className="login">Login</a>
                    </>
                )*/}
            </div>
        </nav>
    );
};

export default Navbar;
