import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate} from 'react-router-dom';
import { AuthContext } from './auth.js';

import './login.css'
import '../../App.css'

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [navigate]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5001/register', { username, password });
            alert("user created");
            navigate("/login")     

        } catch (error) {
            alert(error.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="login-background">
            <div className="login-page">
                <div style={{ height: "10vh" }} />
                <div className="login-text">
                    Register
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="login-input"
                    />
                    <br></br>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                    />
                    <br></br>
                    <button type="submit" className="login-button">Register</button>
                </form>

            </div>
        </div> 
    );
};

export default Register;
