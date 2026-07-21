import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Search, ShieldCheck, Sun, Moon, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

function Navbar() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);
  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Utensils className="h-8 w-8 text-wongnai-orange" />
              <span className="font-bold text-2xl tracking-tight text-wongnai-orange">Ginraide</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link to="/search" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-wongnai-orange dark:hover:text-wongnai-orange transition-colors">
              <Search className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline font-medium">ค้นหาคอมโบ</span>
            </Link>
            
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-wongnai-orange dark:hover:text-wongnai-orange transition-colors">
                <ShieldCheck className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline font-medium">จัดการระบบ</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to={`/profile/${user.username}`} className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-wongnai-orange dark:hover:text-wongnai-orange transition-colors">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 text-wongnai-orange rounded-full flex items-center justify-center font-bold overflow-hidden">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt={user.username} crossOrigin="anonymous" className="w-full h-full object-cover" />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="font-semibold hidden sm:inline">{user.username}</span>
                </Link>
                <button onClick={logout} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="bg-wongnai-orange text-white px-5 py-2 rounded-full font-medium hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/30"
              >
                เข้าสู่ระบบ
              </button>
            )}
            
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </nav>
  );
}

export default Navbar;
