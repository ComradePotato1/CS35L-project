import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import LogItem from '../LogItem/LogItem.jsx';
import { AuthContext } from "../auth/auth";
import '../../App.css';

const History = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [editingLogId, setEditingLogId] = useState(null);
  const ITEMS_PER_PAGE = 7; // Matches your requirement

  // Fetch logs from backend
  const fetchLogs = async () => {
    try {
      const response = await axios.post('http://localhost:5001/get-log', {
        username: user,
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


  if (!user) return <p>Please log in to view history</p>;
  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="history-container">
      <h2>Your Workout History</h2>
      
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