import React, { useEffect, useState, useContext } from 'react';
import '../../App.css';
import { AuthContext } from "../auth/auth.js"
import axios from 'axios';
import LogItem from '../LogItem/LogItem.jsx';


const Social = () => {
    const { user } = useContext(AuthContext);
    const [recs, setRecs] = useState([])
    const [following, setFollowing] = useState([])
    const [follower, setFollower] = useState([]);
    const [recLogs, setRecLogs] = useState([]);
    const [followLogs, setFollowLogs] = useState([]);
    const [followerLogs, setFollowerLogs] = useState([]);
    const [page, setPage] = useState(0);
    const ITEMS_PER_PAGE = 3;

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

    const getFollower = async () => {
        try {
            const follow = await axios.post('http://localhost:5001/get-follow-back', {
                username: user
            });
            setFollower(follow.data.result);

        } catch (err) {
            console.error("Get following failed:", err);
        }
    }


    useEffect(() => {
        getRecs();
        getFollowing();
        getFollower();

    }, []);

    //copied from history.jsx

    const fetchRecLogs = async () => {
        try {
            let log = [];

            const response = await axios.post('http://localhost:5001/get-log', {
                username: recs,
                range_start: 0,
                range_end: 2,
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
                range_start: page * ITEMS_PER_PAGE,
                range_end: (page + 1) * ITEMS_PER_PAGE
            });
            setFollowLogs(response.data.combined || []);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        }
    };

    const fetchFollowerLogs = async () => {
        try {
            const response = await axios.post('http://localhost:5001/get-log', {
                username: follower,
                range_start: page * ITEMS_PER_PAGE,
                range_end: (page + 1) * ITEMS_PER_PAGE
            });
            setFollowerLogs(response.data.combined || []);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        }
    };
    useEffect(() => {
        fetchRecLogs();
        fetchFollowLogs();
        fetchFollowerLogs();
    }, [recs, following, follower]);

    useEffect(() => {
        fetchFollowLogs();
    }, [page]);

    const handleReact = async (logId) => {
        try {
            await axios.post('http://localhost:5001/react', {
                log_id: logId,
                username: user
            });
            fetchRecLogs();
            fetchFollowLogs();
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
            fetchFollowLogs();
        } catch (err) {
            console.error("Reaction failed:", err);
        }
    };


    return (
        <div>
            {user && <p>Social page of {user}!</p>}
            <div>

                <h1>New followers!</h1>
                {followerLogs.length === 0 ? (
                    <p>No workouts recorded yet</p>
                ) : (
                    <>
                        <div className="log-list">
                            {followerLogs.map((log) => (
                                <LogItem
                                    key={log.log_id}
                                    log={log}
                                    isEditing={false}
                                    onReact={handleReact}
                                    onUnreact={handleUnreact}
                                    currentUser={user}
                                    showHeader={true}
                                />
                            ))}
                        </div>
                    </>
                )}

                <h1>Recommended user logs</h1>
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

                <h1>Following user logs</h1>
                {followLogs.length === 0 ? (
                    <p>No workouts recorded yet</p>
                ) : (
                    <>
                        <div className="log-list">
                            {followLogs.map((log) => (
                                <LogItem
                                    key={log.log_id}
                                    log={log}
                                    isEditing={false}
                                    onReact={handleReact}
                                    onUnreact={handleUnreact}
                                    currentUser={user}
                                    showHeader={true}
                                />
                            ))}
                            </div>
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
                                    disabled={followLogs.length < ITEMS_PER_PAGE}
                                >
                                    Next
                                </button>
                            </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Social;