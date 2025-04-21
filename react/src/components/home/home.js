import React, { useEffect, useState, useContext } from 'react';
import '../../App.css';
import { AuthContext } from "../auth/auth.js"



const Home = () => {
    const { user } = useContext(AuthContext);
    return (
        <div>
            {user && <p>Welcome back, {user}!</p>}
        </div>
    );
};

export default Home;