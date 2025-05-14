import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../../App.css';
import { AuthContext } from "../auth/auth.js"
import LogItem from '../LogItem/LogItem.jsx';



const User = () => {
    const { user } = useContext(AuthContext);
    const { queryUser } = useParams();
    const [logs, setLogs] = useState([]);
    const [userExists, setUserExists] = useState(true)

    const fetchLogs = async () => {
        try {
            const response = await axios.post('http://localhost:5001/get-log', {
                username: [user],
                range_start: 1,
                range_end: 5,
            });
            setLogs(response.data.combined || []);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
            setUserExists(false);
        }
    };

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

    useEffect(() => {
        fetchLogs();
    });

    return (
        <div>
            {userExists ? (
                <p>user page for {queryUser}</p>
            ) : (<>
                <p>user does not exist</p>
            </>)}
            
            {logs.length === 0 ? (
                <p>No workouts recorded yet</p>
            ) : (
                <>
                    <div className="log-list">
                        {logs.map((log) => (
                            <LogItem
                                key={log.log_id}
                                log={log}
                                onReact={handleReact}
                                onUnreact={handleUnreact}
                                currentUser={queryUser}
                            />
                        ))}
                    </div>

                   
                </>
            )}
        </div>
    );
};

export default User;