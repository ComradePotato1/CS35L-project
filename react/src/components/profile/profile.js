import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import delay from 'delay';
import '../../App.css';
import { Link } from 'react-router-dom';
import './profile.css';
import { AuthContext } from '../auth/auth.js';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [info, setInfo] = useState({
    username: '',
    name: '',
    profile: '',
    weight: '',
    height: '',
    age: '',
    totalCalories: '',
  });
  const [editing, setEditing] = useState(false);
  const [toggleFollower, setToggleFollower] = useState(true) 
  //const [isOpen, setIsOpen] = useState(false);
  const profileOptions = ['pic-0', 'pic-1', 'pic-2', 'pic-3'];

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
      }
      
    }
    fetchProfile();

    const getFollowers = async () => {
      try {
        const res = await axios.post('http://localhost:5001/get-follower', { followee: user });
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
  }, [user, toggleFollower]);


  const handleEditing = (param) => (tobj) => {
    const value = tobj.target.value;
    setInfo({ ...info, [param]: value });
  };

  const handleEditingBox = (param) => (tobj) => {
    const checked = tobj.target.checked;
    setInfo({ ...info, [param]: checked });
  };


  const handleProfileSelect = (n) => {
    setInfo(prev => ({
      ...prev,
      profile: n}));
  };
  
  const handleSaveEdits = async () => {
    try {
      await axios.post('http://localhost:5001/update-profile', {
        username:   user,
        name:       info.name,
        profile:    info.profile,
        weight:     info.weight,
        height:     info.height,
        dailyGoal:  info.dailyGoal,
        weeklyGoal: info.weeklyGoal
      });
        setEditing(false);
        const popup = document.getElementById('popup');
        popup.style.display = "flex";
        await delay(4900);
        popup.style.display = "none";
    } catch (err) {
      console.error('Could not update profile', err.response);

    }
  };

    const changeToggleFollower = async (b) => {
        try {
            const follow = document.getElementById('follow');
            const followerButton = document.getElementById('followerButton');
            const followingButton = document.getElementById('followingButton');
            //performance issues

            if (b === toggleFollower) {

            } else if (b) {
                followerButton.style.borderBottom = "solid 0.5em #4499cc"
                followingButton.style.borderBottom = "solid 0.5em transparent"
                follow.style.animationDirection = "normal"
                follow.style.animation = "swipe-right 0.2s 1"
                await delay(190);
                await setToggleFollower(b);
            } else {
                followingButton.style.borderBottom = "solid 0.5em #4499cc"
                followerButton.style.borderBottom = "solid 0.5em transparent"
                follow.style.animationDirection = "normal"
                follow.style.animation = "swipe-left 0.2s 1"
                await delay(190);
                await setToggleFollower(b);
            }
        } catch {
            await setToggleFollower(b);
        }
        
    };

  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
      <>
            <div className="popup" id="popup"><span class="popuptext">Edit Profile Success!</span></div>
          <div className={editing ? 'profilepage editing' : 'profilepage'}>
              
        <h2>Your Profile</h2>

        <div className="profilepicpreview" style={{ cursor: 'pointer' }}> {/* onClick={toggleDropdown} */}
          <img src={"/images/profile/" + info.profile + ".png"} alt="Profile" style={{ borderRadius: '50%' }}/>
        </div>

        {editing && (
          <div className="profile-dropdown-menu">
            {profileOptions.map((profile) => (
              <img
                key={profile}
                src={`/images/profile/${profile}.png`}
                alt={`Profile ${profile}`}
                style={{width: '50px', borderRadius: '50%', cursor: 'pointer', margin: '10px', border: info.profile === profile ? '2px solid #4499cc' : 'none'}}
                onClick={() => handleProfileSelect(profile)}
              />
            ))}
          </div>
        )}

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

        {/* <div className="profile">
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
        </div> */}
        <div className="profile">
         <label className="tag">Age:</label>
         {editing ? (
           <input
             type="number"
             value={info.age}
             onChange={handleEditing('age')}
           />
         ) : (
           <span className="val">{info.age || '—'}</span>
         )}
       </div>

       <div className="profile">
         <label className="tag">Total Calories Burned:</label>
         {editing ? (
           <input
             type="number"
             value={info.totalCalories}
             onChange={handleEditing('totalCalories')}
           />
         ) : (
           <span className="val">{info.totalCalories ? info.totalCalories + ' kcal' : '—'}</span>
         )}
       </div>
        <Link to="/logout" className="logout">
          Logout
        </Link>
      </div>

      {/* followers & following moved outside */}
      <div className="followsection">
        {toggleFollower ? (
          <div className="followersbox">
            <div style={{display:"flex", flex:"1 1 100%", flexWarp:"warp"}}>
              <button onClick={() => changeToggleFollower(true)} id="followerButton" className="toggleFollowButton" style={{ borderBottom: "solid 0.5em #4499cc"} } ><h3>Followers</h3></button>
              <button onClick={() => changeToggleFollower(false)} id="followingButton" className="toggleFollowButton"><h3>Following</h3></button>
            </div>
            <span className="followList">
            {followersList.length === 0 ? (
                              <p id="follow">No followers</p>
            ) : (
                <ul id="follow">
                {followersList.map(f => (
                  <li key={f}><a href={"/user/" + f}>{f}</a></li>
                ))}
              </ul>
                          )}
          </span>
        </div>
        ) : (
          <div className="followingbox">
            <div style={{display:"flex", flex:"1 1 100%", flexWarp:"warp"}}>
                <button onClick={() => changeToggleFollower(true)} id="followerButton" className="toggleFollowButton"><h3>Followers</h3></button>
                              <button onClick={() => changeToggleFollower(false)} id="followingButton" className="toggleFollowButton" style={{ borderBottom: "solid 0.5em #4499cc" }}><h3>Following</h3></button>
                          </div>

            {followingList.length === 0 ? (
                              <p id="follow">Not following anyone</p>
                          ) : (
                        
                                  <ul id="follow">
                            {followingList.map(f => (
                                <li key={f}><a href={"/user/" + f}>{f}</a></li>
                            ))}
                                </ul>
                       
              
                              )}
          </div>
        )}
        

        
      </div>
    </>
  );
};

export default Profile;
