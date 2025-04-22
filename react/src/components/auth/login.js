import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './auth.js';

import './login.css'
import '../../App.css'

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [inputbox, setInputbox] = useState("login-input")

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', {
                username,
                password
            });
            //alert(response.data.message)
            login(response.data.user); 
            navigate('/');
            
        } catch (error) {
            setInputbox("login-input-invalid");
            alert(error.response?.data?.error || 'Login failed');
            
        }
    };

    const handleRegister = () => {
        navigate('/register');
    }
   
    return (
        <div className="login-background">
            <div className="login-page">
                <div style={{ height: "10vh" }} />
                <div className="login-text">
                    Login
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={inputbox}
                        />
                    <br></br>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputbox }
                        />
                    <br></br>
                    <button type="submit" className="login-button">LOGIN</button>
                </form>
                <button className="login-button" onClick={handleRegister}>New to the site? Register</button>
            </div>
        </div> 
    );
};

export default Login;
