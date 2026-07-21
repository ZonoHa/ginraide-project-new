import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MessageCircle, Edit2, Image as ImageIcon, Check, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FastAverageColor } from 'fast-average-color';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { username } = useParams();
  const { user, getToken, updateUser } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editImage, setEditImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [bannerColor, setBannerColor] = useState(null);
  const fileInputRef = useRef(null);

  const displayImage = isEditing ? editImage : profileData?.profileImageUrl;

  useEffect(() => {
    if (displayImage) {
      const fac = new FastAverageColor();
      fac.getColorAsync(displayImage, { crossOrigin: 'anonymous' })
        .then(color => {
          setBannerColor(color.hex);
        })
        .catch(e => {
          console.error('Failed to get color', e);
          setBannerColor(null);
        });
    } else {
      setBannerColor(null);
    }
  }, [displayImage]);

  const fetchProfile = () => {
    setLoading(true);
    fetch(`/api/users/${username}`)
      .then(res => {
        if (!res.ok) throw new Error('User not found');
        return res.json();
      })
      .then(data => {
        setProfileData(data.profile);
        setPosts(data.posts);
        setEditBio(data.profile.bio || '');
        setEditImage(data.profile.profileImageUrl || '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [username]);

  const isOwner = user && user.username === username;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setEditImage(data.imageUrl);
        setIsEditing(true);
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ bio: editBio, profileImageUrl: editImage })
      });
      
      if (res.ok) {
        setIsEditing(false);
        if (isOwner) {
          updateUser({ bio: editBio, profileImageUrl: editImage });
        }
        fetchProfile(); // refresh data
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBanUser = async () => {
    if (!window.confirm('ยืนยันแบนผู้ใช้นี้จากการคอมเมนต์เป็นเวลา 3 วัน?')) return;
    try {
      const res = await fetch(`/api/admin/users/${profileData.id}/ban`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        alert('แบนผู้ใช้สำเร็จ');
      } else {
        alert('เกิดข้อผิดพลาดในการแบน');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">กำลังโหลด...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-bold text-xl">{error}</div>;
  if (!profileData) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <div 
          className="h-32 w-full transition-all duration-1000 ease-in-out"
          style={bannerColor ? { background: `linear-gradient(to right, ${bannerColor}88, ${bannerColor})` } : { background: 'linear-gradient(to right, #fb923c, #ea580c)' }}
        ></div>
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end">
            <div className="flex items-end space-x-4 relative">
              <div className="relative -mt-12">
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0 z-10 text-4xl font-bold text-wongnai-orange group">
                  {(isEditing ? editImage : profileData.profileImageUrl) ? (
                    <img src={isEditing ? editImage : profileData.profileImageUrl} alt={username} crossOrigin="anonymous" className="w-full h-full object-cover" />
                  ) : (
                    username.charAt(0).toUpperCase()
                  )}
                  {isEditing && (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ImageIcon className="text-white w-8 h-8" />
                    </div>
                  )}
                </div>
                {isOwner && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 z-20 p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full border-2 border-white dark:border-gray-900 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>
              
              <div className="pb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">@{profileData.username}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profileData.role === 'ADMIN' && <span className="text-wongnai-orange font-bold mr-2">Admin</span>}
                  เข้าร่วมเมื่อ {new Date(profileData.createdAt).toLocaleDateString('th-TH')}
                </p>
              </div>
            </div>
            
            {isOwner && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="mb-2 flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                แก้ไขโปรไฟล์
              </button>
            )}
            {isOwner && isEditing && (
              <div className="mb-2 flex space-x-2">
                <button 
                  onClick={() => { setIsEditing(false); setEditBio(profileData.bio || ''); setEditImage(profileData.profileImageUrl || ''); }}
                  className="flex items-center px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
                >
                  <X className="w-4 h-4 mr-1" /> ยกเลิก
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isUploading}
                  className="flex items-center px-4 py-2 bg-wongnai-orange text-white rounded-xl hover:bg-orange-600 transition-colors shadow-md disabled:opacity-50 font-medium text-sm"
                >
                  <Check className="w-4 h-4 mr-1" /> บันทึก
                </button>
              </div>
            )}
            
            {user?.role === 'ADMIN' && !isOwner && (
              <button 
                onClick={handleBanUser}
                className="mb-2 flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-medium text-sm border border-red-200 dark:border-red-800"
              >
                <ShieldAlert className="w-4 h-4 mr-2" />
                แบนคอมเมนต์ 3 วัน
              </button>
            )}
          </div>
          
          <div className="mt-6">
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">คำอธิบายตัวเอง (Bio)</label>
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="เขียนอะไรบางอย่างเกี่ยวกับคุณ..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all resize-none h-24"
                />
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {profileData.bio || <span className="text-gray-400 italic">ยังไม่มีคำอธิบาย</span>}
              </p>
            )}
          </div>
          
        </div>
      </motion.div>

      {/* User Posts Feed */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white px-2">โพสต์ของ {profileData.username}</h2>
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 text-center text-gray-500 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-800">
            ยังไม่มีโพสต์
          </div>
        ) : (
          posts.map((post, index) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 text-wongnai-orange flex items-center justify-center font-bold text-lg overflow-hidden">
                   {profileData.profileImageUrl ? (
                    <img src={profileData.profileImageUrl} alt={post.author} className="w-full h-full object-cover" />
                  ) : (
                    post.author.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{post.author}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleDateString('th-TH')}</p>
                </div>
              </div>
              
              <div className="px-4 pb-3">
                <h3 className="font-bold text-lg mb-1 dark:text-white">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-200">{post.content}</p>
              </div>
              
              <div className="w-full h-80 bg-gray-100 dark:bg-gray-800">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-800 flex items-center space-x-6">
                <div className="flex items-center text-gray-500 group">
                  <div className="p-2 rounded-full">
                    <Heart className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{post.likes}</span>
                </div>
                <div className="flex items-center text-gray-500 group">
                  <div className="p-2 rounded-full">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{post.comments}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

    </div>
  );
}

export default Profile;
