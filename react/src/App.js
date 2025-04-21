import logo from './logo.svg';
import './App.css';

import Login from "./components/auth/login.js"
import Navbar from "./components/navbar/navbar.js"
import Home  from "./components/home/home.js"

import { useEffect, useState } from "react";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";


function App() {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
      <div className="App">
    <Navbar />
          <Routes>
              <Route path="/" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
              <Route path="/login" element={<Home />} />
              <Route
                  path="/home"
                  element={isAuthenticated ? <Home /> : <Navigate to="/" />}
              />
          </Routes>
    </div>
  );
}

export default App;
