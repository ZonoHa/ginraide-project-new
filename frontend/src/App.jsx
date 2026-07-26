import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ComboSearch from './pages/ComboSearch';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col doodle-bg relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="hidden lg:block pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute top-[15%] left-[5%] animate-float glass-emoji w-24 h-24 text-6xl shadow-orange-500/10">🍜</div>
          <div className="absolute top-[45%] right-[5%] animate-float-delayed glass-emoji w-20 h-20 text-5xl shadow-purple-500/10">🧋</div>
          <div className="absolute bottom-[20%] left-[8%] animate-float-reverse glass-emoji w-20 h-20 text-5xl shadow-yellow-500/10">🍟</div>
          <div className="absolute top-[20%] right-[10%] animate-float glass-emoji w-16 h-16 text-4xl shadow-blue-500/10">🎮</div>
          <div className="absolute bottom-[30%] right-[12%] animate-float-delayed glass-emoji w-24 h-24 text-6xl shadow-red-500/10">🎧</div>
          <div className="absolute top-[60%] left-[12%] animate-float-reverse glass-emoji w-16 h-16 text-4xl shadow-green-500/10">✨</div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<ComboSearch />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile/:username" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
