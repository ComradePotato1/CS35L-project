/*import axios from 'axios';

const API_BASE = 'http://localhost:5001'; //update if hosted elsewhere

export const getHistory = async (username, rangeStart = 0, rangeEnd = 10) => {
    const response = await axios.post(`${API_BASE}/get-log`, {
        username,
        range_start: rangeStart,
        range_end: rangeEnd,
    });
    return response.data.combined;
};

export const addReaction = async (log_id, username) => {
    await axios.post(`${API_BASE}/react`, { log_id, username });
};

export const editLog = async (log_id, updates) => {
    await axios.post(`${API_BASE}/update-log`, {
        log_id,
        activity: updates.activity,
        post: updates.post,
        start: updates.start,
        end: updates.end,
    });
};*/