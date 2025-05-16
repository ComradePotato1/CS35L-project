import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../auth/auth.js';
import axios from 'axios';
import "./navbar.css";

const Navbar = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const excludedRoutes = ['/'];
    const hideNavbar = excludedRoutes.includes(location.pathname);
    const [followbackCount, setFollowbackCount] = useState(0);

    useEffect(() => {
        const handleCount = async () => {
            try {
                const res = await axios.post('http://localhost:5001/get-follow-back', {
                    username: user,
                });
                setFollowbackCount(res.data.result.length);
            } catch (err) {
                alert(err);
                console.error("Get count failed:", err);
            }
        }

        handleCount();

    } );

    return (
        !hideNavbar && (
        <nav className="nav">
            <a href="/home" className="sitename">
                <img src="" alt="logo" className="logo-image"/>
            </a>
            <div className="links">
                {user ? (
                    <a href="/home" className="home">Home</a>
                ) : (<span />)
                }

                {user ? (
                    <a href="/history" className="home">History</a>
                ) : (<span />)
                }

                    {user ? (
                        <div>
                            {followbackCount ? (
                                <a href="/social" className="hover">Social {followbackCount}</a>
                            ) : (
                                <a href="/social" className="home">Social</a>
                            )}
                            
                        </div>
                ) : (<span />)
                }

                {user ? (
                    <a href="/profile" className="login">Profile</a>
                ) : (
                    <a href="/login" className="login">Login</a>
                )
                }
            </div>
            </nav>
        )
    );
};

export default Navbar;
