import React, { useEffect, useState, useContext } from 'react';
import '../../App.css';
import { AuthContext } from "../auth/auth.js"
import axios from 'axios';
import LogItem from '../LogItem/LogItem.jsx';


const Social = () => {
    const { user } = useContext(AuthContext);
    const [recs, setRecs] = useState([])
    const [following, setFollowing] = useState([])
    const [recLogs, setRecLogs] = useState([]);
    const [followLogs, setFollowLogs] = useState([])

    const getRecs = async () => {
        try {
            const recommended = await axios.post('http://localhost:5001/get-user-rec', {
                username: user
            });
            setRecs(recommended.data.result);
            
        } catch (err) {
            console.error("Get rec failed:", err);

        }
    };

    const getFollowing = async () => {
        try {
            const follow = await axios.post('http://localhost:5001/get-followee', {
                follower: user
            });
            setFollowing(follow.data.result);

        } catch (err) {
            console.error("Get following failed:", err);

        }
    };


    useEffect(() => {
        getRecs();
        getFollowing();
        

    }, []);

    //copied from history.jsx

    const fetchRecLogs = async () => {
        try {
            let log = [];

            const response = await axios.post('http://localhost:5001/get-log', {
                username: recs,
                range_start: 1,
                range_end: 3,
            });
            log = response.data.combined;

            setRecLogs(log);
            if (log.length === 0) {
                getRecs();
            }
            
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        }
    };

    const fetchFollowLogs = async () => {
        try {
            const response = await axios.post('http://localhost:5001/get-log', {
                username: following,
                range_start: 1,
                range_end: 3,
            });
            setFollowLogs(response.data.combined || []);
            alert("fetch success");
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        }
    };

    useEffect(() => {
        fetchRecLogs();
        fetchFollowLogs();
    }, [recs, following]);

    const handleReact = async (logId) => {
        try {
            await axios.post('http://localhost:5001/react', {
                log_id: logId,
                username: user
            });
            fetchRecLogs();
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
            fetchRecLogs();
        } catch (err) {
            console.error("Reaction failed:", err);
        }
    };


    return (
        <div>
            {user && <p>Social page of {user}!</p>}
            <div>
                <h3>Recommended user logs</h3>
                {recLogs.length === 0 ? (
                    <p>No workouts recorded yet</p>
                ) : (
                    <>
                        <div className="log-list">
                                {recLogs.map((log) => (
                                <LogItem
                                        key={log.log_id}
                                        log={log}
                                        isEditing={false}
                                        onReact={handleReact}
                                        onUnreact={handleUnreact}
                                        currentUser={user}
                                        showHeader={true }
                                />
                            ))}
                        </div>
                    </>
                )}

                <h3>Following user logs</h3>
                {followLogs.length === 0 ? (
                    <p>No workouts recorded yet</p>
                ) : (
                    <>
                        <div className="log-list">
                            {recLogs.map((log) => (
                                <LogItem
                                    key={log.log_id}
                                    log={log}
                                    isEditing={false}
                                    onReact={handleReact}
                                    onUnreact={handleUnreact}
                                    currentUser={""}
                                    showHeader={true}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Social;