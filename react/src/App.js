import logo from './logo.svg';
import './App.css';

import Login from "./components/auth/login.js"
import Register from "./components/auth/register.js"
import Navbar from "./components/navbar/navbar.js"
import Home from "./components/home/home.js"
import History from "./components/history/history.jsx"
import ProtectedRoute from "./components/auth/ProtectedRoute.js"
import Logout from "./components/auth/logout.js"
import Profile from "./components/profile/profile.js"
import Cover from "./components/cover/cover.js"
import Social from "./components/social/social.js"
import { Auth } from "./components/auth/auth.js"

import { useEffect, useState } from "react";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";


function App() {
    const [user, setUser] = useState(null);

    return (
      <Auth>
      <div className="App">
    <Navbar />
          <Routes>
              <Route path='/' element={<Cover /> } />
              <Route path="/register" element={<Register /> } />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/home" element={<ProtectedRoute> <Home /> </ProtectedRoute>} />
              <Route path="/history" element={ <ProtectedRoute> <History /> </ProtectedRoute>}/>
              <Route path="/profile" element={<ProtectedRoute> <Profile /> </ProtectedRoute> } />
              <Route path="/social" element={<ProtectedRoute> <Social /> </ProtectedRoute>} />
          </Routes>
            </div>
        </Auth>
  );
}

export default App;
