import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

const Home = lazy(() => import('./pages/Home'));
const ComboSearch = lazy(() => import('./pages/ComboSearch'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col doodle-bg relative overflow-hidden">
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
            <Suspense fallback={
              <div className="flex h-full w-full items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wongnai-orange"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<ComboSearch />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/profile/:username" element={<Profile />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
