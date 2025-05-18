import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import LogItem from '../LogItem/LogItem.jsx';
import { AuthContext } from "../auth/auth";
import '../../App.css';
import {Radar, RadarChart,PolarGrid,PolarAngleAxis,PolarRadiusAxis } from 'recharts';

const History = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [editingLogId, setEditingLogId] = useState(null);
  const [data, setData] = useState([]);
  const ITEMS_PER_PAGE = 7;

  // Fetch logs from backend
  const fetchLogs = async () => {
    try {
      const response = await axios.post('http://localhost:5001/get-log', {
        username: [user],
        range_start: page * ITEMS_PER_PAGE,
        range_end: (page + 1) * ITEMS_PER_PAGE
      });
      setLogs(response.data.combined || []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle initial load and page changes
  useEffect(() => {
    if (user) {
      fetchLogs();
      getStats();
    }
  }, [user, page]);

  const handleSaveLog = async (logData) => {
    try {
      const response = await axios.post('http://localhost:5001/log', {
        ...logData,
        username: user
      });
  
      // Optimistic UI update instead of full refresh
      setLogs(prevLogs => 
        logData.log_id 
          ? prevLogs.map(log => 
              log.log_id === logData.log_id 
                ? { ...log, ...logData } 
                : log
            )
          : [...prevLogs, { ...logData, log_id: response.data.log_id }]
      );
      
      setEditingLogId(null);
    } catch (err) {
      console.error("Save failed:", err);
      alert(err.response?.data?.error || "Failed to save");
      fetchLogs(); // Fallback refresh if optimistic update fails
    }
  };

  // Handle reactions (likes)
  const handleReact = async (logId) => {
    try {
      await axios.post('http://localhost:5001/react', {
        log_id: logId,
        username: user
      });
      fetchLogs(); // Refresh to show updated reactions
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };

const handleUnreact = async (logId) => {
    try {
        await axios.post('http://localhost:5001/unreact', {
            log_id: logId,
            username: user
        });
        fetchLogs(); // Refresh to show updated reactions
    } catch (err) {
        console.error("Reaction failed:", err);
    }
};

const getStats = async () => {
  try {
      let stat = await axios.post('http://localhost:5001/get-stats', {
          username: user,
      });
      stat = stat.data.result;
      const sum = stat.aerobic + stat.stretching + stat.strengthening + stat.balance + stat.rest + stat.other
    setData([
      {
        activity: "Aerobic",
        A: (stat.aerobic / sum * 100),
        fullMark: 100,
      },
      {
        activity: "Stretching",
        A: (stat.stretching / sum * 100),
        fullMark: 100,
      },
      {
        activity: "Strengthening",
        A: (stat.strengthening / sum * 100),
        fullMark: 100,
      },
      {
        activity: "Balance",
        A: (stat.balance/ sum * 100),
        fullMark: 100,
      },
      {
        activity: "Rest",
        A: (stat.rest / sum * 100),
        fullMark: 100,
      },
      {
        activity: "Other",
        A: (stat.other / sum * 100),
        fullMark: 100,
      },
    ]);
    
    } catch (err) {
      alert('failed');
        console.error("get failed:", err);
    }
}
//source = https://www.health.harvard.edu/exercise-and-fitness/the-4-most-important-types-of-exercise
//example https://codesandbox.io/p/sandbox/simple-radar-chart-2p5sxm


  if (!user) return <p>Please log in to view history</p>;
  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="history-container">
      <h2>Your Workout History</h2>
      <RadarChart
        cx={300}
        cy={250}
        outerRadius={150}
        width={700}
        height={500}
        data={data}
        style={{marginLeft:"auto"}}
        
      >
        <PolarGrid stroke="#111" />
        <PolarAngleAxis dataKey="activity" />
        <PolarRadiusAxis type="number" domain={[0,100]}/>
        <Radar
          name={user}
          dataKey="A"
          stroke="#55aadd"
          fill="#4499cc"
          fillOpacity={0.6}
        />
    </RadarChart>
      {logs.length === 0 ? (
        <p>No workouts recorded yet</p>
      ) : (
        <>
          <div className="log-list">
            {logs.map((log) => (
              <LogItem
                key={log.log_id}
                log={log}
                isEditing={editingLogId === log.log_id}
                onEdit={() => setEditingLogId(log.log_id)}
                onSave={handleSaveLog}
                onCancel={() => setEditingLogId(null)}
                    onReact={handleReact}
                    onUnreact={handleUnreact}
                currentUser={user}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))} 
              disabled={page === 0}
            >
              Previous
            </button>
            <span>Page {page + 1}</span>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={logs.length < ITEMS_PER_PAGE}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default History;