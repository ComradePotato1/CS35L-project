import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import '../../App.css';
import { Link } from 'react-router-dom';
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
    weeklyGoal: false
  });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  // follower/following state
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      try {
        const res = await axios.post('http://localhost:5001/get-userinfo', { username: user });
        setInfo(res.data.rows[0]);
      } catch (err) {
        console.error('Cannot load profile:', err.response?.data || err);
        setError('Cannot load Profile');
      }
    }
    fetchProfile();

    const getFollowers = async () => {
      try {
        const res = await axios.post('http://localhost:5001/get-follow-back', { username: user });
        setFollowersList(res.data.result || []);
      } catch (err) {
        console.error('Get followers failed:', err);
      }
    };
    const getFollowing = async () => {
      try {
        const res = await axios.post('http://localhost:5001/get-followee', { follower: user });
        setFollowingList(res.data.result || []);
      } catch (err) {
        console.error('Get following failed:', err);
      }
    };
    getFollowers();
    getFollowing();
  }, [user]);

  const handleEditing = (param) => (tobj) => {
    const value = tobj.target.value;
    setInfo({ ...info, [param]: value });
    setError('');
  };

  const handleEditingBox = (param) => (tobj) => {
    const checked = tobj.target.checked;
    setInfo({ ...info, [param]: checked });
    setError('');
  };

  const handleSaveEdits = async () => {
    try {
      await axios.post('http://localhost:5001/update-profile', {
        username:   user,
        name:       info.name,
        weight:     info.weight,
        height:     info.height,
        dailyGoal:  info.dailyGoal,
        weeklyGoal: info.weeklyGoal
      });
      setEditing(false);
    } catch (err) {
      console.error('Could not update profile', err.response);
      setError('Could not update Profile');
    }
  };

  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <>
      <div className={editing ? 'profilepage editing' : 'profilepage'}>
        <h2>Your Profile</h2>

        {/* default profile pic preview */}
        <div className="profilepicpreview">
          <img src="/images/icons/workout.svg" alt="Profile" />
        </div>

        {error && <p className="errors">{error}</p>}

        <button className="editbutton" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit'}
        </button>

        {editing && (
          <button className="savebutton" onClick={handleSaveEdits}>
            Save Changes
          </button>
        )}

        <div className="profile">
          <label className="tag">Username:</label>
          <span className="val">{info.username}</span>
        </div>

        <div className="profile">
          <label className="tag">Name:</label>
          {editing ? (
            <input
              type="text"
              value={info.name}
              onChange={handleEditing('name')}
            />
          ) : (
            <span className="val">{info.name || info.username}</span>
          )}
        </div>

        <div className="profile">
          <label className="tag">Weight (lbs):</label>
          {editing ? (
            <input
              type="number"
              value={info.weight}
              onChange={handleEditing('weight')}
            />
          ) : (
            <span className="val">{info.weight || '—'}</span>
          )}
        </div>

        <div className="profile">
          <label className="tag">Height (in):</label>
          {editing ? (
            <input
              type="number"
              value={info.height}
              onChange={handleEditing('height')}
            />
          ) : (
            <span className="val">{info.height || '—'}</span>
          )}
        </div>

        <div className="profile">
          <label className="tag">Daily Goal:</label>
          {editing ? (
            <input
              type="checkbox"
              checked={info.dailyGoal}
              onChange={handleEditingBox('dailyGoal')}
            />
          ) : (
            <span className="val">{info.dailyGoal ? 'Yes' : 'No'}</span>
          )}
        </div>

        <div className="profile">
          <label className="tag">Weekly Goal:</label>
          {editing ? (
            <input
              type="checkbox"
              checked={info.weeklyGoal}
              onChange={handleEditingBox('weeklyGoal')}
            />
          ) : (
            <span className="val">{info.weeklyGoal ? 'Yes' : 'No'}</span>
          )}
        </div>

        <Link to="/logout" className="logout">
          Logout
        </Link>
      </div>

      {/* followers & following moved outside */}
      <div className="followsection">
        <div className="followersbox">
          <h3>Followers</h3>
          {followersList.length === 0 ? (
            <p>No followers</p>
          ) : (
            <ul>
              {followersList.map(f => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="followingbox">
          <h3>Following</h3>
          {followingList.length === 0 ? (
            <p>Not following anyone</p>
          ) : (
            <ul>
              {followingList.map(f => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
