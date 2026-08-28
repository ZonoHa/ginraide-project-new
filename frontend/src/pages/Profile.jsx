import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MessageCircle, Edit2, Image as ImageIcon, Check, X, ShieldAlert, Bookmark, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FastAverageColor } from 'fast-average-color';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useBookmarks } from '../context/BookmarkContext';

function Profile() {
  const { username } = useParams();
  const { user, getToken, updateUser } = useAuth();
  const { addToast } = useToast();
  const { bookmarkedPosts, bookmarkedCombos, togglePostBookmark, updateBookmarkedPost, isPostBookmarked, toggleComboBookmark, isComboBookmarked } = useBookmarks();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedCombo, setSelectedCombo] = useState(null);
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
        addToast('อัปโหลดรูปภาพสำเร็จ', 'success');
      } else {
        addToast('อัปโหลดรูปภาพไม่สำเร็จ', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ', 'error');
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
        addToast('บันทึกโปรไฟล์สำเร็จ', 'success');
      } else {
        addToast('อัปเดตโปรไฟล์ไม่สำเร็จ', 'error');
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
        addToast('แบนผู้ใช้สำเร็จ', 'success');
      } else {
        addToast('เกิดข้อผิดพลาดในการแบน', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostImage, setEditPostImage] = useState('');
  const [isUploadingPostImage, setIsUploadingPostImage] = useState(false);
  const editPostFileInputRef = useRef(null);

  const handleEditPostFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setIsUploadingPostImage(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setEditPostImage(data.imageUrl);
        addToast('อัปโหลดรูปภาพสำเร็จ', 'success');
      } else {
        addToast('อัปโหลดรูปภาพไม่สำเร็จ', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ', 'error');
    } finally {
      setIsUploadingPostImage(false);
    }
  };

  const handleEditPostSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/posts/${editingPostId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ title: editPostTitle, content: editPostContent, imageUrl: editPostImage })
      });
      if (res.ok) {
        addToast('อัปเดตโพสต์สำเร็จ', 'success');
        setIsEditPostModalOpen(false);
        fetchProfile(); // Refresh posts
      } else {
        addToast('อัปเดตโพสต์ไม่สำเร็จ', 'error');
      }
    } catch (err) {
      addToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('คุณต้องการลบโพสต์นี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (res.ok) {
        addToast('ลบโพสต์สำเร็จ', 'success');
        fetchProfile();
      } else {
        addToast('ลบโพสต์ไม่สำเร็จ', 'error');
      }
    } catch (err) {
      addToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleLike = (postId) => {
    if (!user) return addToast('กรุณาเข้าสู่ระบบ', 'error');
    fetch(`/api/posts/${postId}/like`, { 
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: data.likesCount !== undefined ? data.likesCount : Math.max(0, data.liked ? post.likes + 1 : post.likes - 1),
              isLikedByMe: data.liked
            };
          }
          return post;
        }));
        if (isPostBookmarked(postId)) {
          updateBookmarkedPost(postId, (post) => ({
            ...post,
            likes: data.likesCount !== undefined ? data.likesCount : Math.max(0, data.liked ? post.likes + 1 : post.likes - 1),
            isLikedByMe: data.liked
          }));
        }
      })
      .catch(err => console.error(err));
  };

  const [expandedPostId, setExpandedPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [newCommentText, setNewCommentText] = useState('');

  const toggleComments = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      if (!comments[postId]) {
        try {
          const res = await fetch(`/api/posts/${postId}/comments`);
          const data = await res.json();
          setComments(prev => ({ ...prev, [postId]: data }));
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const handleAddComment = async (postId) => {
    if (!newCommentText.trim()) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ text: newCommentText })
      });
      if (res.ok) {
        setNewCommentText('');
        const commentsRes = await fetch(`/api/posts/${postId}/comments`);
        const data = await commentsRes.json();
        setComments(prev => ({ ...prev, [postId]: data }));
        fetchProfile();
      } else {
        addToast('เกิดข้อผิดพลาด หรือคุณอาจถูกแบน', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('ยืนยันลบคอมเมนต์นี้?')) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const commentsRes = await fetch(`/api/posts/${postId}/comments`);
        const data = await commentsRes.json();
        setComments(prev => ({ ...prev, [postId]: data }));
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('รหัสผ่านใหม่ไม่ตรงกัน', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร', 'error');
      return;
    }
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, 'success');
        setIsPasswordModalOpen(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        addToast(data.message, 'error');
      }
    } catch (err) {
      addToast('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', 'error');
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
              <div className="mb-2 flex space-x-2">
                <button 
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
                >
                  เปลี่ยนรหัสผ่าน
                </button>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  แก้ไขโปรไฟล์
                </button>
              </div>
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

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 ${activeTab === 'posts' ? 'border-wongnai-orange text-wongnai-orange' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          โพสต์ของฉัน
        </button>
        {isOwner && (
          <>
            <button
              onClick={() => setActiveTab('saved_posts')}
              className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 ${activeTab === 'saved_posts' ? 'border-wongnai-orange text-wongnai-orange' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
              โพสต์ที่บันทึก
            </button>
            <button
              onClick={() => setActiveTab('saved_combos')}
              className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 ${activeTab === 'saved_combos' ? 'border-wongnai-orange text-wongnai-orange' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
              คอมโบที่บันทึก
            </button>
          </>
        )}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'posts' && (
          posts.length === 0 ? (
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
              <div className="p-4 flex justify-between items-start">
                <div className="flex items-center space-x-3">
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
                {isOwner && (
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => {
                        setEditingPostId(post.id);
                        setEditPostTitle(post.title);
                        setEditPostContent(post.content);
                        setEditPostImage(post.imageUrl || '');
                        setIsEditPostModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-wongnai-orange bg-gray-50 hover:bg-orange-50 dark:bg-gray-800 dark:hover:bg-orange-900/30 rounded-full transition-colors"
                      title="แก้ไขโพสต์"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/30 rounded-full transition-colors"
                      title="ลบโพสต์"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="px-4 pb-3">
                <h3 className="font-bold text-lg mb-1 dark:text-white">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-200">{post.content}</p>
              </div>
              
              <div className="w-full h-80 bg-gray-100 dark:bg-gray-800">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-800 flex items-center space-x-6">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center transition-colors group ${post.isLikedByMe ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                >
                  <div className="p-2 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                    <Heart className={`h-5 w-5 ${post.isLikedByMe ? 'fill-red-500 text-red-500' : ''}`} />
                  </div>
                  <span className="font-medium">{post.likes}</span>
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center transition-colors group ${expandedPostId === post.id ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
                >
                  <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{post.comments}</span>
                </button>
              </div>

              {/* Comments Section */}
              {expandedPostId === post.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-4 py-4 space-y-4"
                >
                  <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide pr-2">
                    {comments[post.id]?.map((comment, i) => (
                      <div key={comment.id} className="flex space-x-2">
                        <Link to={`/profile/${comment.author.username}`} className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 text-wongnai-orange flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-wongnai-orange transition-all">
                          {comment.author.profileImageUrl ? (
                            <img src={comment.author.profileImageUrl} alt={comment.author.username} crossOrigin="anonymous" className="w-full h-full object-cover" />
                          ) : (
                            comment.author.username.charAt(0).toUpperCase()
                          )}
                        </Link>
                        <div className="flex-1 flex flex-col group">
                          <div className="flex items-start justify-between w-full">
                            <div className="flex-1 min-w-0">
                              <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm inline-block max-w-full">
                                <div className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-0.5">{comment.author.username}</div>
                                <div className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">{comment.text}</div>
                              </div>
                              <div className="text-[11px] text-gray-400 mt-1 ml-2">
                                {new Date(comment.createdAt).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} น.
                              </div>
                            </div>
                            
                            {user && (user.id === post.authorId || user.role === 'ADMIN') && (
                              <button 
                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                className="ml-2 mt-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                title="ลบคอมเมนต์"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!comments[post.id] || comments[post.id].length === 0) && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">ยังไม่มีความคิดเห็น</p>
                    )}
                  </div>
                  
                  {/* Add Comment Input */}
                  <div className="flex space-x-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {!post.commentsEnabled ? (
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full px-4 py-2 text-sm text-center font-medium italic">
                        เจ้าของโพสต์ปิดการแสดงความคิดเห็น
                      </div>
                    ) : user && user.commentBanUntil && new Date(user.commentBanUntil) > new Date() ? (
                      <div className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full px-4 py-2 text-sm border border-red-200 dark:border-red-800/50 text-center font-medium">
                        คุณถูกระงับสิทธิ์
                      </div>
                    ) : (
                      <>
                        <input 
                          type="text" 
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          placeholder="แสดงความคิดเห็น..." 
                          className="flex-1 bg-white dark:bg-gray-800 dark:text-white rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-wongnai-orange/50 border border-gray-200 dark:border-gray-700 transition-all"
                        />
                        <button 
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newCommentText.trim()}
                          className="bg-wongnai-orange text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ส่ง
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
          )
        )}

        {activeTab === 'saved_posts' && (
          bookmarkedPosts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 text-center text-gray-500 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-800">
              ยังไม่มีโพสต์ที่บันทึกไว้
            </div>
          ) : (
            bookmarkedPosts.map((post, index) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                <div className="p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 text-wongnai-orange flex items-center justify-center font-bold text-lg overflow-hidden">
                     {post.authorImage ? (
                      <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover" />
                    ) : (
                      post.author?.charAt(0).toUpperCase()
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
                
                <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center transition-colors group ${post.isLikedByMe ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                    >
                      <div className="p-2 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                        <Heart className={`h-5 w-5 ${post.isLikedByMe ? 'fill-red-500 text-red-500' : ''}`} />
                      </div>
                      <span className="font-medium">{post.likes}</span>
                    </button>
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className={`flex items-center transition-colors group ${expandedPostId === post.id ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
                    >
                      <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{post.comments}</span>
                    </button>
                  </div>
                  <button 
                    onClick={() => togglePostBookmark(post)}
                    className="p-2 rounded-full transition-colors group text-wongnai-orange"
                  >
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-full p-1">
                      <Bookmark className="h-5 w-5 fill-wongnai-orange" />
                    </div>
                  </button>
                </div>

                {/* Comments Section */}
                {expandedPostId === post.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-4 py-4 space-y-4"
                  >
                    <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide pr-2">
                      {comments[post.id]?.map((comment, i) => (
                        <div key={comment.id} className="flex space-x-2">
                          <Link to={`/profile/${comment.author.username}`} className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 text-wongnai-orange flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-wongnai-orange transition-all">
                            {comment.author.profileImageUrl ? (
                              <img src={comment.author.profileImageUrl} alt={comment.author.username} crossOrigin="anonymous" className="w-full h-full object-cover" />
                            ) : (
                              comment.author.username.charAt(0).toUpperCase()
                            )}
                          </Link>
                          <div className="flex-1 flex flex-col group">
                            <div className="flex items-start justify-between w-full">
                              <div className="flex-1 min-w-0">
                                <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm inline-block max-w-full">
                                  <div className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-0.5">{comment.author.username}</div>
                                  <div className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">{comment.text}</div>
                                </div>
                                <div className="text-[11px] text-gray-400 mt-1 ml-2">
                                  {new Date(comment.createdAt).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} น.
                                </div>
                              </div>
                              
                              {user && (user.id === post.authorId || user.role === 'ADMIN') && (
                                <button 
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                  className="ml-2 mt-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                  title="ลบคอมเมนต์"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!comments[post.id] || comments[post.id].length === 0) && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">ยังไม่มีความคิดเห็น</p>
                      )}
                    </div>
                    
                    {/* Add Comment Input */}
                    <div className="flex space-x-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {!post.commentsEnabled ? (
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full px-4 py-2 text-sm text-center font-medium italic">
                          เจ้าของโพสต์ปิดการแสดงความคิดเห็น
                        </div>
                      ) : user && user.commentBanUntil && new Date(user.commentBanUntil) > new Date() ? (
                        <div className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full px-4 py-2 text-sm border border-red-200 dark:border-red-800/50 text-center font-medium">
                          คุณถูกระงับสิทธิ์
                        </div>
                      ) : (
                        <>
                          <input 
                            type="text" 
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            placeholder="แสดงความคิดเห็น..." 
                            className="flex-1 bg-white dark:bg-gray-800 dark:text-white rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-wongnai-orange/50 border border-gray-200 dark:border-gray-700 transition-all"
                          />
                          <button 
                            onClick={() => handleAddComment(post.id)}
                            disabled={!newCommentText.trim()}
                            className="bg-wongnai-orange text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            ส่ง
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )
        )}

        {activeTab === 'saved_combos' && (
          bookmarkedCombos.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 text-center text-gray-500 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-800">
              ยังไม่มีคอมโบที่บันทึกไว้
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
              {bookmarkedCombos.map((combo, index) => (
                <motion.div 
                  key={combo.id}
                  onClick={() => setSelectedCombo(combo)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer relative"
                >
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-3xl pt-6 sm:pt-8 flex flex-col items-center justify-between h-full relative overflow-hidden shadow-md border border-white/50">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComboBookmark(combo);
                      }}
                      className="absolute top-3 left-3 z-30 p-2 rounded-full transition-all shadow-sm backdrop-blur-sm border bg-wongnai-orange/20 border-wongnai-orange/30 text-wongnai-orange"
                    >
                      <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 fill-wongnai-orange" />
                    </button>
                    
                    <div className="relative mt-2 sm:mt-0 px-2 sm:px-4 mb-4">
                      <img 
                        src={combo.imageUrl} 
                        alt={combo.name} 
                        className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded-full shadow-2xl ring-4 ring-white/70 relative z-10" 
                      />
                    </div>
                    
                    <div className="text-center w-full bg-white/95 backdrop-blur-md mt-auto p-3 sm:p-4 border-t border-white/80 shadow-[0_-15px_30px_rgba(0,0,0,0.04)]">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">{combo.name}</h3>
                      <div className="flex items-center justify-center mt-1 space-x-1 text-sm sm:text-base">
                        {combo.totalPrice !== undefined && combo.totalPrice !== null ? (
                          <span className="font-bold text-wongnai-orange">฿{combo.totalPrice}</span>
                        ) : (
                          <span className="font-bold text-green-500 text-xs sm:text-sm">ทำเองอร่อยชัวร์ 🍳</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Combo Details Modal */}
      <AnimatePresence>
        {selectedCombo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCombo(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-20 flex space-x-2">
                <button 
                  onClick={() => setSelectedCombo(null)}
                  className="p-2 bg-white/50 hover:bg-white dark:bg-black/50 dark:hover:bg-black backdrop-blur rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-800 dark:text-white" />
                </button>
              </div>
              
              {/* Header Image */}
              <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 relative flex-shrink-0">
                <img 
                  src={selectedCombo.imageUrl} 
                  alt={selectedCombo.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
                {/* Title & Price/Info */}
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{selectedCombo.name}</h2>
                  <div className="text-right flex-shrink-0 ml-4">
                    {selectedCombo.totalPrice !== undefined && selectedCombo.totalPrice !== null ? (
                      <>
                        <span className="text-sm text-gray-500 dark:text-gray-400 block">ราคารวม</span>
                        <span className="text-2xl font-black text-wongnai-orange">฿{selectedCombo.totalPrice}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-gray-500 dark:text-gray-400 block">หมวดหมู่</span>
                        <span className="text-xl font-black text-green-500">เมนูทำเอง</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Ingredients Breakdown */}
                {selectedCombo.ingredients && selectedCombo.ingredients.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">วัตถุดิบที่ใช้</h3>
                    <ul className="space-y-2">
                      {selectedCombo.ingredients.map((i, idx) => {
                        const name = i.product?.name || i.ingredient?.name;
                        const price = i.product?.price;
                        return (
                          <li key={idx} className="flex justify-between text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg text-sm">
                            <span>{name}</span>
                            {price !== undefined && <span className="font-medium">฿{price}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Instructions */}
                {selectedCombo.description && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">คำอธิบายและวิธีทำ</h3>
                    <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                      <div className="text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium">
                        {selectedCombo.description}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">เปลี่ยนรหัสผ่าน</h2>
                  <button onClick={() => setIsPasswordModalOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
                
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">รหัสผ่านเดิม</label>
                    <input 
                      type="password" 
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
                    <input 
                      type="password" 
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ยืนยันรหัสผ่านใหม่</label>
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full mt-6 py-3 bg-wongnai-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-md"
                  >
                    บันทึกรหัสผ่านใหม่
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Post Modal */}
      <AnimatePresence>
        {isEditPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditPostModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">แก้ไขโพสต์</h2>
                  <button onClick={() => setIsEditPostModalOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
                
                <form onSubmit={handleEditPostSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">รูปภาพ (ถ้ามี)</label>
                    <div className="flex items-center space-x-4">
                      {editPostImage ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                          <img src={editPostImage} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setEditPostImage('')}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => editPostFileInputRef.current?.click()}
                        disabled={isUploadingPostImage}
                        className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {isUploadingPostImage ? 'กำลังอัปโหลด...' : (editPostImage ? 'เปลี่ยนรูปภาพ' : 'เพิ่มรูปภาพ')}
                      </button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={editPostFileInputRef} 
                        onChange={handleEditPostFileChange} 
                        className="hidden" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">หัวข้อโพสต์</label>
                    <input 
                      type="text" 
                      required
                      value={editPostTitle}
                      onChange={(e) => setEditPostTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">เนื้อหา</label>
                    <textarea 
                      required
                      value={editPostContent}
                      onChange={(e) => setEditPostContent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all resize-none h-32"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full mt-6 py-3 bg-wongnai-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-md"
                  >
                    บันทึกการแก้ไข
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Profile;
