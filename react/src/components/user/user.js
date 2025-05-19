import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../../App.css';
import { AuthContext } from "../auth/auth.js"
import LogItem from '../LogItem/LogItem.jsx';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';


const User = () => {
    const { user } = useContext(AuthContext);
    const { queryUser } = useParams();
    const [logs, setLogs] = useState([]);
    const [userExists, setUserExists] = useState(true)
    const [editingLogId, setEditingLogId] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [data, setData] = useState([]);

    const fetchLogs = async () => {
        try {
            let numLogs = 3;
            if (isFollowing) {
                numLogs = 15;
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
        getStats();
        if (queryUser) {
            fetchLogs();
        }
    }, [queryUser, isFollowing]);


    const getStats = async () => {
        try {
            let queryUserStat = await axios.post('http://localhost:5001/get-stats', {
                username: queryUser,
            });

            let currUserStat = await axios.post('http://localhost:5001/get-stats', {
                username: user,
            });
            queryUserStat = queryUserStat.data.result;
            currUserStat = currUserStat.data.result;
            const queryUserSum = queryUserStat.aerobic + queryUserStat.stretching + queryUserStat.strengthening + queryUserStat.balance + queryUserStat.rest + queryUserStat.other
            const currUserSum = currUserStat.aerobic + currUserStat.stretching + currUserStat.strengthening + currUserStat.balance + currUserStat.rest + currUserStat.other
            setData([
                {
                    activity: "Aerobic",
                    A: (queryUserStat.aerobic / queryUserSum * 100),
                    B: (currUserStat.aerobic / currUserSum * 100),
                    fullMark: 100,
                },
                {
                    activity: "Stretching",
                    A: (queryUserStat.stretching / queryUserSum * 100),
                    B: (currUserStat.stretching / currUserSum * 100),
                    fullMark: 100,
                },
                {
                    activity: "Strengthening",
                    A: (queryUserStat.strengthening / queryUserSum * 100),
                    B: (currUserStat.strengthening / currUserSum * 100),
                    fullMark: 100,
                },
                {
                    activity: "Balance",
                    A: (queryUserStat.balance / queryUserSum * 100),
                    B: (currUserStat.balance / currUserSum * 100),
                    fullMark: 100,
                },
                {
                    activity: "Rest",
                    A: (queryUserStat.rest / queryUserSum * 100),
                    B: (currUserStat.rest / currUserSum * 100),
                    fullMark: 100,
                },
                {
                    activity: "Other",
                    A: (queryUserStat.other / queryUserSum * 100),
                    B: (currUserStat.other / currUserSum * 100),
                    fullMark: 100,
                },
            ]);

        } catch (err) {
            console.error("get failed:", err);
        }
    }
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
                        <RadarChart cx={300} cy={250} outerRadius={150} width={700} height={500} data={data}>
                            <PolarGrid stroke="#111" />
                            <PolarAngleAxis dataKey="activity" />
                            <PolarRadiusAxis type="number" domain={[-10, 100]} />
                            <Radar name={queryUser} dataKey="A" stroke="#4499cc" fill="#4499cc" fillOpacity={0.6} strokeWidth="3.5" />
                            <Radar name={user} dataKey="B" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} strokeWidth="3.5"/>
                            <Legend></Legend>
                        </RadarChart>
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
                        <p>Showing at most { Math.min(logs.length, 15) } entries</p>
                   
                </>
            )}
        </div>
    );
};

export default User;