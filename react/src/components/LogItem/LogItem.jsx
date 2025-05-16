import React, { useState, useContext } from 'react';
import { AuthContext } from "../auth/auth.js"


const LogItem = ({
    log,
    isEditing,
    onEdit=null,
    onSave=null,
    onCancel=null,
    onReact,
    onUnreact,
    currentUser,
    showHeader=false
}) => {

    const { user } = useContext(AuthContext);


    const [formData, setFormData] = useState({
        username: log.username,
        activity: log.activity || '',
        day: log.day ? log.day.split('T')[0] : '', // format for date input
        start: log.start || '',
        duration: log.duration || 30, // Default to 30 minutes
        post: log.post || ''
    });

    const hasReacted = log.reacts?.includes(currentUser);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            log_id: log.log_id, 
            ...formData
        });
    };

    const handleReactClick = () => {
        if (hasReacted) {
            onUnreact(log.log_id);
        } else {
            onReact(log.log_id);
        }
    };

    // Helper to format duration for display
    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    return (
        <div className={`log-item ${isEditing ? 'editing' : ''}`}>
            {isEditing ? (
                // Edit Mode
                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-group">
                        <label>Activity:</label>
                        <select
                            name="activity"
                            value={formData.activity}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select activity</option>
                            <option value="Running">Running</option>
                            <option value="Cycling">Cycling</option>
                            <option value="Swimming">Swimming</option>
                            <option value="Weight Training">Weight Training</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Date:</label>
                        <input
                            type="date"
                            name="day"
                            value={formData.day.substring(0,10)}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="time-group">
                        <div className="form-group">
                            <label>Start Time:</label>
                            <input
                                type="time"
                                name="start"
                                value={formData.start}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Duration (minutes):</label>
                            <input
                                type="number"
                                name="duration"
                                min="1"
                                max="1440" // 24 hours
                                value={formData.duration}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Notes:</label>
                        <textarea
                            name="post"
                            value={formData.post}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="save-btn">
                            Save Changes
                        </button>
                        <button 
                            type="button" 
                            onClick={onCancel}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                // View Mode
                    <>
                        {showHeader ? (
                            <div classname="log-username">post made by <a href={ "/user/" + log.username }>{log.username}</a></div>
                        ) : (
                            <></>
                        ) }
                        
                    <div className="log-header">
                        <h3>{log.activity}</h3>
                        <span className="timestamp">
                            {new Date(log.timestamp).toLocaleString()}
                        </span>
                    </div>
                        <div className="log-details">
                        {log.post && <p className="log-notes">{log.post}</p>}
                        <div className="log-meta">
                            <span className="log-date">{log.day.split("T")[0]+ " "}</span>
                            <span className="log-time">
                                Started at: {log.start} • Duration: {formatDuration(log.duration)}
                            </span>
                        </div>
                    </div>

                        <div className="log-actions">
                            {currentUser === log.username ? (
                                <button
                                    onClick={() => onEdit(log.log_id)}
                                    className="edit-btn"
                                >
                                    Edit
                                </button>) : (
                                    <></>
                                )

                         }
                        <button
                            onClick={handleReactClick}
                            className={`react-btn ${hasReacted ? 'reacted' : ''}`}
                        >
                            {hasReacted ? '✓ Liked' : 'Like'} 
                            {log.reacts?.length > 0 && (
                                <span className="react-count">{log.reacts.length}</span>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default LogItem;
