import React, { createContext, useContext, useState, useEffect } from 'react';

const BookmarkContext = createContext();

export function useBookmarks() {
  return useContext(BookmarkContext);
}

export function BookmarkProvider({ children }) {
  // Store the full objects so we don't need to fetch from API again
  const [bookmarkedPosts, setBookmarkedPosts] = useState(() => {
    const saved = localStorage.getItem('bookmarkedPosts');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookmarkedCombos, setBookmarkedCombos] = useState(() => {
    const saved = localStorage.getItem('bookmarkedCombos');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bookmarkedPosts', JSON.stringify(bookmarkedPosts));
  }, [bookmarkedPosts]);

  useEffect(() => {
    localStorage.setItem('bookmarkedCombos', JSON.stringify(bookmarkedCombos));
  }, [bookmarkedCombos]);

  // Actions for Posts
  const isPostBookmarked = (id) => bookmarkedPosts.some(p => p.id === id);
  const togglePostBookmark = (post) => {
    setBookmarkedPosts(prev => {
      if (prev.some(p => p.id === post.id)) {
        return prev.filter(p => p.id !== post.id);
      }
      return [post, ...prev];
    });
  };

  // Actions for Combos
  const isComboBookmarked = (id) => bookmarkedCombos.some(c => c.id === id);
  const toggleComboBookmark = (combo) => {
    setBookmarkedCombos(prev => {
      if (prev.some(c => c.id === combo.id)) {
        return prev.filter(c => c.id !== combo.id);
      }
      return [combo, ...prev];
    });
  };

  return (
    <BookmarkContext.Provider value={{
      bookmarkedPosts,
      isPostBookmarked,
      togglePostBookmark,
      bookmarkedCombos,
      isComboBookmarked,
      toggleComboBookmark
    }}>
      {children}
    </BookmarkContext.Provider>
  );
}
