import React, { useState, useContext } from 'react';
import axios from 'axios';
import '../../App.css';
import { AuthContext } from "../auth/auth.js";

const Home = () => {
  const { user } = useContext(AuthContext);

  const [activity, setActivity] = useState('');
  const [day, setDay] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [post, setPost] = useState('');
  const [error, setError] = useState('');
  const [icon, setIcon] = useState('/images/icons/workout.svg');

    function changeIcon(e) {
        if (!e.indexOf("run")) {
            setIcon('/images/icons/running.svg');
        } else if (!e.indexOf("lift") || !e.indexOf("weight")) {
            setIcon('/images/icons/dumbbell.svg');
        } else if (!e.indexOf("swim")) {
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
      setDay('');
      setStart('');
      setEnd('');
      setPost('');
      setError('');
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
          <img src={icon} alt="icon" className="home-icon"></img>

      <section className="add-workout">
        <h3>Add a Workout</h3>
        <form onSubmit={handleSubmit} className="workout-form">
          <div>
            <label>Activity:</label>
            <input
              type="text"
              value={activity}
                onChange={e => { setActivity(e.target.value); changeIcon(e.target.value) }}
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
