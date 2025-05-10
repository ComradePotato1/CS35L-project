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
        // the server returns { rows: [ { user_id, username, name, weight, height, dailyGoal, weeklyGoal } ] }
        setInfo(res.data.rows[0]);
      } catch (err) {
        console.error('Failed to load profile:', err.response?.data || err);
        setError('Could not load profile data.');
      }
    }

    fetchProfile();
  }, [user]);

  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>

      {error && <p className="error-message">{error}</p>}

      <div className="profile-field">
        <span className="field-label">Username:</span>
        <span className="field-value">{info.username}</span>
      </div>

      <div className="profile-field">
        <span className="field-label">Name:</span>
        <span className="field-value">{info.name || '—'}</span>
      </div>

      <div className="profile-field">
        <span className="field-label">Weight:</span>
        <span className="field-value">{info.weight || '—'} lbs</span>
      </div>

      <div className="profile-field">
        <span className="field-label">Height:</span>
        <span className="field-value">{info.height || '—'} in</span>
      </div>

      <div className="profile-field">
        <span className="field-label">Daily Goal:</span>
        <span className="field-value">
          {info.dailyGoal ? 'Yes' : 'No'}
        </span>
      </div>

      <div className="profile-field">
        <span className="field-label">Weekly Goal:</span>
        <span className="field-value">
          {info.weeklyGoal ? 'Yes' : 'No'}
        </span>
      </div>
    </div>
  );
};

export default Profile;