import React from 'react';
import { Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Picks from './components/Picks';
import Standings from './components/Standings';
import Chat from './components/Chat';
import ProtectedRoute from './components/ProtectedRoute';
import PastResults from './components/PastResults';
import MakePicks from './components/MakePicks';
import '@fortawesome/fontawesome-free/css/all.min.css';


function App() {
  return (
    <div className="App">
      <NavBar> </NavBar> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute element={Profile} />} />
        <Route path="/picks" element={<ProtectedRoute element={Picks} />} />
        <Route path="/standings" element={<ProtectedRoute element={Standings} />} />
        <Route path="/chat" element={<ProtectedRoute element={Chat} />} />
        <Route path="/results" element={<PastResults />} />
        <Route path="/makepicks" element={<ProtectedRoute element={MakePicks} />} />
      </Routes>
    </div>
  );
}

export default App;
