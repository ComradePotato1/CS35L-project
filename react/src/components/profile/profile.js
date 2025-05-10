import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import '../../App.css';
import './profile.css';
import { AuthContext } from '../auth/auth.js';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [info, setInfo] = useState({
    username: '',
    name: '',
    weight: '',
    height: '',
    dailyGoal: false,
    weeklyGoal: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      try {
        
        
        const res = await axios.post('http://localhost:5001/get-userinfo', {
          username: user
        });

        
        setInfo(res.data.rows[0]);
      } catch (err) {
        console.error('Cannot load profile:', err.response?.data || err);
        setError('Cannot load Profile');
      }
    }

    fetchProfile();
  }, [user]);

  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="container">
      <h2>Your Profile</h2>

      {error && <p className="errors">{error}</p>}

      <div className="profile">

        <span className="tag">Username:</span>
        <span className="val">{info.username}</span>
      </div>

      <div className="profile">
        <span className="tag">Name (default username):</span>
        <span className="val">{info.name ||  info.username}</span>
      </div>

      <div className="profile">
        <span className="tag">Weight:</span>
        <span className="val">{info.weight || '—'} lbs</span>
      </div>

      <div className="profile">
        <span className="tag">Height:</span>
        <span className="val">{info.height || '—'} in</span>
      </div>

      <div className="profile">
        <span className="tag">Daily Goal Reached:</span>
        <span className="val">
          {info.dailyGoal ? 'Yes' : 'No'}
        </span>
      </div>

      <div className="profile">
        <span className="tag">Weekly Goal Reached:</span>
        <span className="val">
          {info.weeklyGoal ? 'Yes' : 'No'}
        </span>
      </div>
    </div>
  );
};

export default Profile;