import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../auth/auth.js';

import "./navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);



    return (
        <nav className="nav">
            <a href="/" className="sitename">
                {/* Logo or website name */}
                <img src="" alt="logo" className="logo-image"/>
            </a>
            <div className="links">
                {/* Always visible links */}
                <a href="/" className="home">Home</a>
                <a href="/history" className="home">History</a>
                
                {user ? (
                    <a href="/logout" className="login">Log out</a>
                ) : (
                    <a href="/login" className="login">Login</a>
                )
                }
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
