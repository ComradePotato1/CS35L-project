import React, { useEffect, useState, useContext } from 'react';
import '../../App.css';
import { AuthContext } from "../auth/auth.js"


const Social = () => {
    const { user } = useContext(AuthContext);
    return (
        <div>
            {user && <p>Social page of {user}!</p>}
        </div>
    );
};

export default Social;