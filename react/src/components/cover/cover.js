import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './cover.css'

import AOS from 'aos'
import 'aos/dist/aos.css';


const Cover = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        AOS.init({ duration: 2000 });
    }, []);

    const handleLogin = () => {
        navigate('/login');
    }

    const handleRegister = () => {
        navigate('/register');
    }
    

    return (
        <div className="cover-page">
        <div className="cover-background">
            <div style={{ height: "8vh" }}></div>
            <img className="cover-app-icon" src="/images/eggert-2.jpg" alt="app-icon" data-aos="fade-up" data-aos-once="true" />
                <div className="header-text" data-aos="fade-up" data-aos-once="true">App</div>
                <div style={{ height: "5vh" } }></div>
                <button onClick={handleRegister} className="cover-register-button" data-aos="fade-up" data-aos-delay="300" data-aos-once="true" >New user? Register</button>
                <br />
                <button onClick={handleLogin} className="cover-login-button" data-aos="fade-up" data-aos-delay="300" data-aos-once="true" >Old user? Login</button>
            </div>
        </div>
    );
};

export default Cover;