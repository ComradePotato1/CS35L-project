import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import './home.css'
import '../../App.css';
import { AuthContext } from "../auth/auth.js";
import delay from 'delay';

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
  const [pastWorkouts, setPastWorkouts] = useState([]);


  useEffect(() => {
    if (!user) {
      return;
    }
    const pastArray = async() => {
      try {
        const {data} = await axios.post('http://localhost:5001/get-log', {username: [user], range_start: 0, range_end: 3});
        console.log('home recent logs:', data.combined);
        setPastWorkouts(data.combined || []);
      } catch (error){
        console.error('No workouts found',error);
      }
    }
    pastArray();
  }, [user]);


  function changeIcon(text) {
    const lower = text.toLowerCase();
    if (lower.includes("run") || lower.includes('ran')) {
        setIcon('/images/icons/running.svg');
        } else if (lower.includes("lift") || lower.includes("weight")) {
        setIcon('/images/icons/dumbbell.svg');
        } else if (lower.includes("swim") || lower.includes("swam") ||  lower.includes("water")) {
        setIcon('/images/icons/swimming.svg');
        } else if (lower.includes('bik') || lower.includes('cycl')) {
        setIcon('/images/icons/cycle.webp');
        } else if (lower.includes('box')) {
        setIcon('/images/icons/boxing.svg');
        } else if (lower.includes('yoga')) {
        setIcon('/images/icons/yoga.svg')
        } else if (lower.includes('pilate')) {
            setIcon('/images/icons/pilates.svg')
        }  else if (lower.includes('hik') || lower.includes('walk')) {
        setIcon('/images/icons/hiking.png')
        } else if (lower.includes('meditat') || lower.includes('rest')) {
        setIcon('/images/icons/meditation.png')
        } else if (lower.includes('ball')) {
        setIcon('/images/icons/ball.png')
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

      await axios.post('http://localhost:5001/add-stats', {
        username: user,
          activity,
            duration,
      });
        const popup = document.getElementById('popup');
        popup.style.display = "flex";
        await delay(1900);
        popup.style.display = "none";

      setActivity('');
      setDay(today); //default to todays date, should prob make end date to length of workout.
      setStart(currentTime);
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
          <div class="popup-home" id="popup"><span class="popuptext">Workout Logged!</span></div>
      <h2>Welcome back, {user}!</h2>
      <img src={icon} alt="icon" className="home-icon" />

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
              type="number"
              name="duration"
              min ={1}
              max={1440}
              value={duration}
                          onChange={e => { setDuration(e.target.value); autoUpdateStart(e.target.value); setError(''); }}
              placeholder="Duration (in minutes)"
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

      <section className="pastworkouts">
        <h3>
          Past Workouts
        </h3>
        {pastWorkouts.length === 0 ? (
          <p>No recent workouts</p>): (
          <div className="pastwork">
            {pastWorkouts.map(log => (
              <div key={log.log_id} className="pastitem">
                <strong>{log.activity}</strong> on {log.day} at {log.start} for {log.duration} min
              </div>
            ))}
          </div>
          )}
      </section>
    </div>
  );
};

export default Home;
