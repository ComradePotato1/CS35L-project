import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import '../../App.css';
import { AuthContext } from "../auth/auth.js"


const User = () => {
    const { user } = useContext(AuthContext); 
    const { queryUser } = useParams();
    return (
        <div>
            <p>user page for {queryUser}</p> 
        </div>
    );
};

export default User;