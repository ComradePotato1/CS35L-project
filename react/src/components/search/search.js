import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../auth/auth';
import { useNavigate } from 'react-router-dom';
import './search.css';

const UserSearch = () => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5001/search-user', {
        username: searchTerm
      });
      setResults(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Error searching users');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (followeeUsername, isFollowing) => {
    try {
      await axios.post('http://localhost:5001/follow', {
        follower: user,
        followee: followeeUsername,
        unfollow: isFollowing
      });
      // Update UI to reflect follow status
      setResults(prev => prev.map(u => 
        u.username === followeeUsername 
          ? { ...u, isFollowing: !isFollowing } 
          : u
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating follow status');
    }
  };

  const viewProfile = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className="user-search-container">
      <h2>Search Users</h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by username..."
          className="search-input"
        />
        <button 
          type="submit" 
          className="search-button"
          disabled={loading || !searchTerm.trim()}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="search-results">
        {results.map((userResult) => (
          <div key={userResult.username} className="user-card">
            <div 
              className="user-info" 
              onClick={() => viewProfile(userResult.username)}
            >
              <img 
                src={`/images/profiles/${userResult.profile || 'pic-0'}.png`} 
                alt={userResult.username}
                className="user-avatar"
              />
              <div>
                <h3>{userResult.username}</h3>
                <p>{userResult.name || 'No name provided'}</p>
              </div>
            </div>
            {userResult.username !== user && (
              <button
                onClick={() => handleFollow(userResult.username, userResult.isFollowing)}
                className={`follow-button ${userResult.isFollowing ? 'following' : ''}`}
              >
                {userResult.isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearch;