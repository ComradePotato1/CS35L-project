import React, { useEffect, useState, useContext } from 'react';
import '../../App.css';
import { AuthContext } from "../auth/auth.js"


const Profile = () => {
    const { user } = useContext(AuthContext);
    return (
        <div>
            {user && <p>Profile page of {user}!</p>}
            <a href="/logout">Log out</a>
        </div>
    );
};

export default Profile;