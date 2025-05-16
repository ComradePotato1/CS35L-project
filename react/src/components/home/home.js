import React, { useState, useContext } from 'react';
import axios from 'axios';
import './home.css'
import '../../App.css';
import { AuthContext } from "../auth/auth.js";

const Home = () => {
  const { user } = useContext(AuthContext);

  const today = new Date().toISOString().split('T')[0];   
  const now = new Date();

  const currentTime = now.toTimeString().slice(0,5);      

  const [activity, setActivity] = useState('');
  const [day, setDay] = useState(today);
  const [start, setStart] = useState(currentTime);
  const [duration, setDuration] = useState('');
  const [post, setPost] = useState('');
  const [error, setError] = useState('');
  const [icon, setIcon] = useState('/images/icons/workout.svg');

  function changeIcon(text) {
    const lower = text.toLowerCase();
    if (lower.includes("run") || lower.includes('ran')) {
      setIcon('/images/icons/running.svg');
    } else if (lower.includes("lift") || lower.includes("weight")) {
      setIcon('/images/icons/dumbbell.svg');
    } else if (lower.includes("swim") || lower.includes("swam")) {
      setIcon('/images/icons/swimming.svg');
    } else if (lower.includes('bike') || lower.includes('biking')) {
      setIcon('/images/icons/bike.svg');
    } else if (lower.includes('box')) {
      setIcon('/images/icons/boxing.svg');
    } else if (lower.includes('yoga')) {
      setIcon('/images/icons/yoga.svg')
    } else if (lower.includes('pilate')) {
        setIcon('/images/icons/pilates.svg')
    }

    else {
      setIcon('/images/icons/workout.svg');
    }
    }

    const autoUpdateStart = (e) => {
        let updated = new Date();
        //updated.setHours(start.split(":")[0]);
        //updated.setMinutes(start.split(":")[1]);
        updated = new Date(updated - 60000 * e);
        setStart(updated.toTimeString().slice(0, 5))
        
    }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (duration <= 0) {
      setError('Duration must be at least 1 minute');
      return;
    }

    if (duration > 1440){
      setError('Duration cannot exceed 24 hours')
      return;
    }

    try {
      await axios.post('http://localhost:5001/log', {
        username: user,
        activity,
        day,
        start,
        duration,
        post
      });


      setActivity('');
      setDay(today); //default to todays date, should prob make end date to length of workout.
      setStart('');
      setDuration('');
      setPost('');
      setError('');
      setIcon('/images/icons/workout.svg');
    } catch (error) {
      console.error('Failed to add Workout:', error.response?.data || error);
      alert('There was an error adding your workout.');
    }
  };

  if (!user) {
    return <p>Please log in to add workouts.</p>;
  }

  return (
    <div className="page">
      <h2>Welcome back, {user}!</h2>
      <img src={icon} alt="icon" className="hicon" />

      <section className="workout">
        <h3>Add a Workout</h3>
        <form onSubmit={handleSubmit} className="form">
          <div>
            <label>Activity:</label>
            <input
              type="text"
              value={activity}
              onChange={e => { setActivity(e.target.value); changeIcon(e.target.value); }}
              placeholder="Exercise"
              required
            />
          </div>

          <div>
            <label>Date:</label>
            <input
              type="date"
              value={day}
              onChange={e => { setDay(e.target.value); setError(''); }}
              max={today}
              required
            />
          </div>

          <div>
            <label>Start Time:</label>
            <input
              type="time"
              value={start}
              onChange={e => { setStart(e.target.value); setError(''); }}
              required
            />
          </div>

          <div>
            <label>Duration:</label>
            <input
              type="text"
              min ="1"
              max="1440"
              value={duration}
                          onChange={e => { setDuration(e.target.value); autoUpdateStart(e.target.value); setError(''); }}
              placeholder="Duration"
              required
            />
          </div>

          <div>
            <label>Notes:</label>
            <input
              type="text"
              value={post}
              onChange={e => setPost(e.target.value)}
              placeholder="Comments"
            />
          </div>

          {error && <p className="errors">{error}</p>}

          <button type="submit">Submit Workout</button>
        </form>
      </section>
    </div>
  );
};

export default Home;
