import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Image as ImageIcon, MoreHorizontal, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user, getToken } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Comments state
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [newCommentText, setNewCommentText] = useState('');
  const [postMenuOpen, setPostMenuOpen] = useState(null);
  const [editPostModal, setEditPostModal] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const fetchPosts = () => {
    const headers = {};
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    fetch('/api/posts', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error("API error:", data);
          setPosts([]);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0 && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-wongnai-orange', 'ring-opacity-50', 'transition-all', 'duration-1000');
          setTimeout(() => element.classList.remove('ring-4', 'ring-wongnai-orange', 'ring-opacity-50'), 2000);
        }, 300);
      }
    }
  }, [posts]);

  const handleCreatePost = () => {
    if (!user) return alert('กรุณาเข้าสู่ระบบก่อนโพสต์');
    if (!newPostTitle || !newPostContent) {
      alert('กรุณากรอกหัวข้อและเนื้อหา');
      return;
    }
    
    fetch('/api/posts', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ title: newPostTitle, content: newPostContent, imageUrl: selectedImage })
    })
      .then(res => res.json())
      .then(() => {
        setNewPostTitle('');
        setNewPostContent('');
        setSelectedImage(null);
        fetchPosts(); // Refresh feed
      })
      .catch(err => console.error(err));
  };

  const handleLike = (postId) => {
    if (!user) return alert('กรุณาเข้าสู่ระบบก่อนกดถูกใจ');
    fetch(`/api/posts/${postId}/like`, { 
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        // Optimistic update
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: data.liked ? post.likes + 1 : post.likes - 1,
              isLikedByMe: data.liked
            };
          }
          return post;
        }));
      })
      .catch(err => console.error(err));
  };

  const toggleComments = (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      // Fetch comments if not already fetched or just always fetch to be fresh
      fetch(`/api/posts/${postId}/comments`)
        .then(res => res.json())
        .then(data => {
          setComments(prev => ({ ...prev, [postId]: data }));
        })
        .catch(err => console.error(err));
    }
  };

  const handleAddComment = (postId) => {
    if (!user) return alert('กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น');
    if (!newCommentText.trim()) return;

    fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ text: newCommentText })
    })
      .then(res => res.json())
      .then(newComment => {
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment]
        }));
        setNewCommentText('');
        // Also increment comment count locally
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return { ...post, comments: post.comments + 1 };
          }
          return post;
        }));
      })
      .catch(err => console.error(err));
  };

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
        setSelectedImage(data.imageUrl);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleComments = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}/toggle-comments`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setPostMenuOpen(null);
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEditPost = async () => {
    try {
      const res = await fetch(`/api/posts/${editPostModal.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ title: editPostTitle, content: editPostContent })
      });
      if (res.ok) {
        setEditPostModal(null);
        fetchPosts();
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('ยืนยันลบโพสต์นี้ถาวร?')) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        fetchPosts();
      } else {
        alert('เกิดข้อผิดพลาดในการลบโพสต์');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      
      {/* Create Post Box */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 transition-colors"
      >
        <div className="flex space-x-3">
          <Link to={user ? `/profile/${user.username}` : "#"} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-wongnai-orange hover:ring-2 hover:ring-wongnai-orange transition-all">
            {user ? (
              user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.username} crossOrigin="anonymous" className="w-full h-full object-cover" />
              ) : (
                user.username.charAt(0).toUpperCase()
              )
            ) : <ImageIcon />}
          </Link>
          <div className="flex-1 space-y-2">
            <input 
              type="text" 
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="หัวข้อเมนูคอมโบ..." 
              className="w-full bg-gray-50 dark:bg-gray-800 dark:text-gray-100 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all font-bold placeholder-gray-400 dark:placeholder-gray-500"
            />
            <textarea 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="คุณมีสูตรเด็ดอะไรมาแชร์วันนี้?" 
              className="w-full bg-gray-50 dark:bg-gray-800 dark:text-gray-100 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all resize-none min-h-[80px] placeholder-gray-400 dark:placeholder-gray-500"
            />
            {selectedImage && (
              <div className="relative mt-2 inline-block">
                <img src={selectedImage} alt="Preview" className="h-32 rounded-lg object-cover shadow-sm border border-gray-200 dark:border-gray-700" />
                <button 
                  onClick={() => setSelectedImage(null)} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            {isUploading && <p className="text-sm text-wongnai-orange font-medium animate-pulse mt-1">กำลังอัปโหลดรูปภาพ...</p>}
          </div>
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
          <div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploading}
              className="flex items-center text-gray-500 hover:text-wongnai-orange transition-colors px-3 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <ImageIcon className="h-5 w-5 mr-2" />
              <span className="font-medium text-sm">อัปโหลดรูปภาพ</span>
            </button>
          </div>
          <button 
            onClick={handleCreatePost} 
            disabled={isUploading}
            className="bg-wongnai-orange text-white px-6 py-1.5 rounded-full font-medium text-sm hover:bg-orange-600 shadow-md disabled:opacity-50"
          >
            โพสต์
          </button>
        </div>
      </motion.div>

      {/* Feed */}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <motion.div 
            key={post.id}
            id={`post-${post.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link to={`/profile/${post.author}`} className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 text-wongnai-orange flex items-center justify-center font-bold text-lg hover:ring-2 hover:ring-wongnai-orange transition-all overflow-hidden">
                  {post.authorImage ? (
                    <img src={post.authorImage} alt={post.author} crossOrigin="anonymous" className="w-full h-full object-cover" />
                  ) : (
                    post.author.charAt(0).toUpperCase()
                  )}
                </Link>
                <div>
                  <Link to={`/profile/${post.author}`}>
                    <h4 className="font-bold text-gray-900 dark:text-white hover:underline decoration-wongnai-orange">{post.author}</h4>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleDateString('th-TH')}</p>
                </div>
              </div>
              
              {user && (user.id === post.authorId || user.role === 'ADMIN') && (
                <div className="relative">
                  <button 
                    onClick={() => setPostMenuOpen(postMenuOpen === post.id ? null : post.id)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  
                  {postMenuOpen === post.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-20">
                      {user.id === post.authorId && (
                        <>
                          <button 
                            onClick={() => { setEditPostModal(post); setEditPostTitle(post.title); setEditPostContent(post.content); setPostMenuOpen(null); }}
                            className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                          >
                            <Edit2 className="w-4 h-4 mr-2" /> แก้ไขโพสต์
                          </button>
                          <button 
                            onClick={() => handleToggleComments(post.id)}
                            className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" /> 
                            {post.commentsEnabled ? 'ปิดคอมเมนต์' : 'เปิดคอมเมนต์'}
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> ลบโพสต์
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="px-4 pb-3">
              <h3 className="font-bold text-lg mb-1 dark:text-white">{post.title}</h3>
              <p className="text-gray-600 dark:text-gray-200">{post.content}</p>
            </div>
            
            <div 
              className="w-full h-80 bg-gray-100 dark:bg-gray-800 cursor-pointer"
              onClick={() => setFullscreenImage(post.imageUrl)}
            >
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <div className="flex space-x-6">
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
            </div>
            
            {/* Comments Section */}
            {expandedPostId === post.id && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-4 py-4 space-y-4"
              >
                {/* List Comments */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
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
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm inline-block">
                              <span className="font-bold text-sm text-gray-900 dark:text-gray-100 mr-2">{comment.author.username}</span>
                              <span className="text-sm text-gray-700 dark:text-gray-300 break-words">{comment.text}</span>
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็นสิ!</p>
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
                      คุณถูกระงับสิทธิ์การคอมเมนต์จนถึงวันที่ {new Date(user.commentBanUntil).toLocaleDateString('th-TH')} เวลา {new Date(user.commentBanUntil).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})} น.
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
        ))}
      </div>

      {/* Edit Post Modal */}
      <AnimatePresence>
        {editPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditPostModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800 z-10"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-bold dark:text-white">แก้ไขโพสต์</h3>
                <button onClick={() => setEditPostModal(null)} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <input 
                  type="text" 
                  value={editPostTitle}
                  onChange={(e) => setEditPostTitle(e.target.value)}
                  placeholder="หัวข้อ..." 
                  className="w-full bg-gray-50 dark:bg-gray-800 dark:text-gray-100 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all font-bold border border-gray-200 dark:border-gray-700"
                />
                <textarea 
                  value={editPostContent}
                  onChange={(e) => setEditPostContent(e.target.value)}
                  placeholder="เนื้อหา..." 
                  className="w-full bg-gray-50 dark:bg-gray-800 dark:text-gray-100 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all resize-none min-h-[120px] border border-gray-200 dark:border-gray-700"
                />
                <button 
                  onClick={handleSaveEditPost} 
                  className="w-full bg-wongnai-orange text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-orange-600 shadow-md transition-colors"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={fullscreenImage}
              alt="Fullscreen view"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;
