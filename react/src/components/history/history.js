import React, { useEffect, useState, useContext } from 'react';
import '../../App.css';
import { AuthContext } from "../auth/auth.js"


const History = () => {
    const { user } = useContext(AuthContext);
    return (
        <div>
            {user && <p>History page of {user}!</p>}
        </div>
    );
};

export default History;