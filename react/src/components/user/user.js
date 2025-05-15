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
    const [editingLogId, setEditingLogId] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);

    const fetchLogs = async () => {
        try {
            let numLogs = 3;
            if (isFollowing) {
                numLogs = 20;
            }
            const response = await axios.post('http://localhost:5001/get-log', {
                username: [queryUser],
                range_start: 0,
                range_end: numLogs,
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
            fetchLogs()
        }
    };

    const handleFollow = async () => {
        try {
            await axios.post('http://localhost:5001/follow', {
                follower: user,
                followee: queryUser,
                unfollow: isFollowing
            })
            setIsFollowing(!isFollowing)
        } catch (err) {
            console.error("folllow failed ", err)
        }
    }

    const refreshFollow = async () => {
        try {
            const response = await axios.post("http://localhost:5001/get-follower", {
                followee: queryUser
            })
            setIsFollowing(response.data.result.indexOf(user) !== -1);
        }
        catch (err) {
            console.error("get follow failed")
        }
    }


    useEffect(() => {
        refreshFollow();
        if (queryUser) {
            fetchLogs();
        }
    }, [queryUser, isFollowing]);

    return (
        <div>
            {userExists ? (
                <>
                <p>user page for {queryUser}</p>
                    <button
                        onClick={handleFollow}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                </>
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

                   
                </>
            )}
        </div>
    );
};

export default User;