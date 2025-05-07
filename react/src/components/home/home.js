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
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [post, setPost] = useState('');
  const [error, setError] = useState('');
  const [icon, setIcon] = useState('/images/icons/workout.svg');

  function changeIcon(text) {
    const lower = text.toLowerCase();
    if (lower.includes("run")) {
      setIcon('/images/icons/running.svg');
    } else if (lower.includes("lift") || lower.includes("weight")) {
      setIcon('/images/icons/dumbbell.svg');
    } else if (lower.includes("swim")) {
      setIcon('/images/icons/swimming.svg');
    } else {
      setIcon('/images/icons/workout.svg');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (start && end && start >= end) {
      setError('Start time must be before end time');
      return;
    }

    if (day === today && end && end >= currentTime) {
      setError('End time cannot be later than the current time');
      return;
    }

    try {
      await axios.post('http://localhost:5001/log', {
        username: user,
        activity,
        day,
        start,
        end,
        post
      });


      setActivity('');
      setDay(today); //default to todays date, should prob make end date to length of workout.
      setStart('');
      setEnd('');
      setPost('');
      setError('');
      setIcon('/images/icons/workout.svg');
    } catch (err) {
      console.error('Failed to add Workout:', err.response?.data || err);
      alert('There was an error adding your workout.');
    }
  };

  if (!user) {
    return <p>Please log in to add workouts.</p>;
  }

  return (
    <div className="home-container">
      <h2>Welcome back, {user}!</h2>
      <img src={icon} alt="icon" className="home-icon" />

      <section className="add-workout">
        <h3>Add a Workout</h3>
        <form onSubmit={handleSubmit} className="workout-form">
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
            <label>End Time:</label>
            <input
              type="time"
              value={end}
              onChange={e => { setEnd(e.target.value); setError(''); }}
              max={day === today ? currentTime : undefined}
              required
            />
          </div>

          <div>
            <label>Notes:</label>
            <textarea
              value={post}
              onChange={e => setPost(e.target.value)}
              placeholder="Comments"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit">Submit Workout</button>
        </form>
      </section>
    </div>
  );
};

export default Home;
