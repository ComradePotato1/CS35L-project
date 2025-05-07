import React, { useState } from 'react';

const LogItem = ({
    log,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    onReact,
    currentUser
}) => {
    const [formData, setFormData] = useState({
        activity: log.activity || '',
        day: log.day ? log.day.split('T')[0] : '', //format for date input
        start: log.start || '',
        end: log.end || '',
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
                            value={formData.day}
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
                            <label>End Time:</label>
                            <input
                                type="time"
                                name="end"
                                value={formData.end}
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
          <div className="log-header">
            <h3>{log.activity}</h3>
            <span className="timestamp">
              {new Date(log.timestamp).toLocaleString()}
            </span>
          </div>

          <div className="log-details">
            {log.post && <p className="log-notes">{log.post}</p>}
            <div className="log-meta">
              <span className="log-date">{log.day}</span>
              <span className="log-time">
                {log.start} - {log.end}
              </span>
            </div>
          </div>

          <div className="log-actions">
            <button 
              onClick={() => onEdit(log.log_id)} 
              className="edit-btn"
            >
              Edit
            </button>
            <button
              onClick={() => onReact(log.log_id)}
              disabled={hasReacted}
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
