import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, CheckCircle2, Circle, X, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBookmarks } from '../context/BookmarkContext';

function ComboSearch() {
  const { isComboBookmarked, toggleComboBookmark } = useBookmarks();
  const [budget, setBudget] = useState('');
  const [searchedBudget, setSearchedBudget] = useState(null); // track what was actually searched
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') === 'ingredient' ? 'ingredient' : 'budget';
  }); // 'budget' or 'ingredient'
  const [combos, setCombos] = useState([]);
  const [fridgeMenus, setFridgeMenus] = useState([]);
  const [fridgeIngredients, setFridgeIngredients] = useState([]);
  const [selectedFridgeIngredients, setSelectedFridgeIngredients] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const filteredIngredients = useMemo(() => {
    return ingredientSearch 
      ? fridgeIngredients.filter(p => p.name.toLowerCase().includes(ingredientSearch.toLowerCase()))
      : fridgeIngredients.slice(0, 12);
  }, [fridgeIngredients, ingredientSearch]);

  // Fetch combos and fridge data on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'ingredient') setActiveTab('ingredient');
    else setActiveTab('budget');
    setShowAll(false);
  }, [location.search]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/combos').then(res => res.json()),
      fetch('/api/fridge/menus').then(res => res.json()),
      fetch('/api/fridge/ingredients').then(res => res.json())
    ])
      .then(([combosData, menusData, ingredientsData]) => {
        if (Array.isArray(combosData)) setCombos(combosData);
        if (Array.isArray(menusData)) setFridgeMenus(menusData);
        if (Array.isArray(ingredientsData)) setFridgeIngredients(ingredientsData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);



  const toggleIngredient = (id) => {
    setSelectedFridgeIngredients(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleIngredientSearch = () => {
    fetch('/api/fridge/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIngredients: selectedFridgeIngredients })
    })
      .then(res => res.json())
      .then(data => { 
        if (Array.isArray(data)) setFridgeMenus(data); 
        setShowAll(false);
      })
      .catch(err => console.error(err));
  };

  const handleBudgetSearch = () => {
    fetch(`/api/combos?maxBudget=${budget}`)
      .then(res => res.json())
      .then(data => {
        setCombos(data);
        setSearchedBudget(parseFloat(budget)); // remember what budget was searched
        setShowAll(false);
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative text-center space-y-6 py-12 lg:py-20 mb-4 z-0">
        {/* Ambient Gradient Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-4xl h-[350px] bg-gradient-to-r from-orange-400/30 via-pink-500/20 to-purple-500/30 blur-[100px] -z-10 rounded-full pointer-events-none dark:from-orange-500/20 dark:via-pink-500/10 dark:to-purple-500/20"></div>
        
        {/* Floating Food Emojis (Moved from App.jsx) */}
        <div className="hidden lg:block pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-[10%] left-[-5%] animate-float glass-emoji w-24 h-24 text-6xl shadow-orange-500/10">🍜</div>
          <div className="absolute top-[30%] right-[-5%] animate-float-delayed glass-emoji w-20 h-20 text-5xl shadow-purple-500/10">🥤</div>
          <div className="absolute top-[80%] left-[-2%] animate-float-reverse glass-emoji w-20 h-20 text-5xl shadow-yellow-500/10">🍟</div>
          <div className="absolute top-[15%] right-[10%] animate-float glass-emoji w-16 h-16 text-4xl shadow-blue-500/10">🍙</div>
          <div className="absolute top-[90%] right-[5%] animate-float-delayed glass-emoji w-24 h-24 text-6xl shadow-red-500/10">🍔</div>
          <div className="absolute top-[60%] left-[10%] animate-float-reverse glass-emoji w-16 h-16 text-4xl shadow-green-500/10">🍕</div>
        </div>
        
        {/* Floating Badges */}
        <div className="absolute top-4 left-[10%] hidden md:block animate-float-delayed z-0">
           <span className="glass px-5 py-2.5 rounded-full text-sm font-bold text-wongnai-orange shadow-lg rotate-[-8deg] inline-block">🔥 เมนูฮิต</span>
        </div>
        <div className="absolute bottom-4 right-[10%] hidden md:block animate-float z-0">
           <span className="glass px-5 py-2.5 rounded-full text-sm font-bold text-blue-500 shadow-lg rotate-[8deg] inline-block">💡 ไอเดียเพียบ</span>
        </div>
        <div className="absolute top-8 right-[20%] hidden lg:block animate-float-reverse z-0">
           <span className="glass px-5 py-2.5 rounded-full text-sm font-bold text-green-500 shadow-lg rotate-[12deg] inline-block">💰 คุ้มสุดๆ</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.1] relative z-10">
          ค้นหา <span className="text-transparent bg-clip-text bg-gradient-to-r from-wongnai-orange to-red-500 drop-shadow-sm">คอมโบอาหาร</span><br/>ที่ใช่สำหรับคุณ
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium relative z-10 px-4">
          อิ่มอร่อยคุ้มค่าด้วยเมนูเด็ดจากร้านสะดวกซื้อ ไม่ว่าจะค้นหาจากงบประมาณ หรือวัตถุดิบที่คุณมีอยู่แล้ว
        </p>
      </div>

      {/* Search & Tabs Glass Container */}
      <div className="max-w-6xl mx-auto glass p-6 md:p-8 rounded-3xl relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60 dark:border-gray-700/50">
        
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button 
            onClick={() => setActiveTab('budget')}
            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-sm ${activeTab === 'budget' ? 'bg-wongnai-orange text-white shadow-xl shadow-orange-500/40 -translate-y-1 scale-105 glow-active' : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:-translate-y-0.5 border border-gray-100 dark:border-gray-700'}`}
          >
            ค้นหาจากงบประมาณ
          </button>
          <button 
            onClick={() => setActiveTab('ingredient')}
            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-sm ${activeTab === 'ingredient' ? 'bg-wongnai-orange text-white shadow-xl shadow-orange-500/40 -translate-y-1 scale-105 glow-active' : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:-translate-y-0.5 border border-gray-100 dark:border-gray-700'}`}
          >
            ค้นหาจากวัตถุดิบที่มี
          </button>
        </div>

        {/* Search Bar (Budget) */}
        {activeTab === 'budget' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-wongnai-orange font-bold text-xl">฿</span>
              </div>
              <input 
                type="number" 
                min="0"
                value={budget}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || Number(val) >= 0) {
                    setBudget(val);
                  }
                }}
                placeholder="งบประมาณของคุณ (เช่น 50)" 
                className="w-full pl-10 pr-4 py-4 rounded-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-transparent focus:border-wongnai-orange focus:ring-4 focus:ring-orange-500/20 transition-all outline-none text-xl font-bold text-gray-900 dark:text-white shadow-inner"
              />
            </div>
            <button 
              onClick={handleBudgetSearch}
              className="bg-gray-900 dark:bg-wongnai-orange text-white px-8 py-4 rounded-2xl hover:bg-gray-800 dark:hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-gray-900/20 dark:shadow-orange-500/30 flex items-center justify-center font-bold text-lg hover:-translate-y-1"
            >
              <Search className="w-6 h-6 mr-2" />
              ค้นหา
            </button>
          </motion.div>
        )}

        {/* Ingredient Selector */}
        {activeTab === 'ingredient' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto w-full"
          >
            <h3 className="text-lg font-bold mb-4 text-center text-gray-800 dark:text-gray-200">เลือกวัตถุดิบที่คุณมีอยู่แล้ว</h3>
            
            {/* Search Input for Ingredients */}
            <div className="max-w-xl mx-auto mb-6 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="ค้นหาวัตถุดิบเพิ่มเติม (พิมพ์ชื่อวัตถุดิบ...)"
                value={ingredientSearch}
                onChange={(e) => setIngredientSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 focus:border-wongnai-orange focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm sm:text-base text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8 max-w-5xl mx-auto">
              {filteredIngredients.map(product => (
                <button
                  key={product.id}
                  onClick={() => toggleIngredient(product.id)}
                  className={`flex items-center p-3 rounded-xl border-2 transition-all duration-300 font-medium shadow-sm hover:-translate-y-1 ${
                    selectedFridgeIngredients.includes(product.id) 
                    ? 'border-wongnai-orange bg-orange-50 dark:bg-orange-900/40 text-wongnai-orange' 
                    : 'border-white/50 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 hover:border-orange-200 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {selectedFridgeIngredients.includes(product.id) ? (
                    <CheckCircle2 className="w-5 h-5 mr-2 text-wongnai-orange flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-sm truncate">{product.name}</span>
                </button>
              ))}
              {fridgeIngredients.length === 0 && <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-4">กำลังโหลดวัตถุดิบ...</p>}
              {fridgeIngredients.length > 0 && ingredientSearch && filteredIngredients.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-4">ไม่พบวัตถุดิบ "{ingredientSearch}"</p>
              )}
            </div>
            <div className="flex justify-center">
              <button 
                onClick={handleIngredientSearch}
                className="bg-gray-900 dark:bg-wongnai-orange text-white px-10 py-4 rounded-2xl hover:bg-gray-800 dark:hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-gray-900/20 dark:shadow-orange-500/30 flex items-center font-bold text-lg hover:-translate-y-1"
              >
                <Search className="w-6 h-6 mr-2" />
                ค้นหาเมนูจากวัตถุดิบ
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Results Grid */}
      <div className="pt-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'budget' ? 'เมนูคอมโบแนะนำ (เซเว่น)' : 'เมนูจากวัตถุดิบในตู้ (ทำเอง)'}
            </h2>
            {searchedBudget && activeTab === 'budget' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ค้นหาใกล้เคียงงบ <span className="font-bold text-wongnai-orange">฿{searchedBudget}</span> — เรียงจากใกล้ที่สุดไปหางที่สุด
              </p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
                <div className="w-full h-24 sm:h-32 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : (activeTab === 'budget' ? combos : fridgeMenus).length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">ไม่พบเมนูที่ค้นหา</h3>
              <p className="text-sm">ลองค้นหาด้วยคำอื่น หรือเพิ่มวัตถุดิบดูนะครับ</p>
            </div>
          ) : (
            (activeTab === 'budget' ? combos : fridgeMenus).slice(0, showAll ? undefined : 6).map((combo, index) => (
            <motion.div 
              key={combo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer relative"
              onClick={() => setSelectedCombo(combo)}
            >
              <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-3xl pt-6 sm:pt-8 flex flex-col items-center justify-between h-full relative overflow-hidden shadow-md hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2 transition-all duration-500 border border-white/50">
                {/* Decorative Ambient Backgrounds */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute top-20 -left-10 w-28 h-28 bg-yellow-400/30 rounded-full blur-xl pointer-events-none"></div>
                <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>
                
                {/* Sparkle Decorations */}
                <div className="absolute top-6 right-6 text-orange-300/60 text-lg pointer-events-none animate-pulse">✨</div>
                <div className="absolute top-24 left-4 text-yellow-400/50 text-sm pointer-events-none animate-bounce" style={{animationDuration: '3s'}}>✦</div>

                {/* Bookmark Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComboBookmark(combo);
                  }}
                  className={`absolute top-3 left-3 z-30 p-2 rounded-full transition-all shadow-sm backdrop-blur-sm border ${
                    isComboBookmarked(combo.id) 
                      ? 'bg-wongnai-orange/20 border-wongnai-orange/30 text-wongnai-orange' 
                      : 'bg-white/50 border-white/60 text-gray-400 hover:text-wongnai-orange hover:bg-white'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isComboBookmarked(combo.id) ? 'fill-wongnai-orange' : ''}`} />
                </button>

                {/* Budget Diff Badge (only shown when searching by budget) */}
                {activeTab === 'budget' && searchedBudget && (
                  <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full z-20 ${
                    combo.totalPrice <= searchedBudget
                      ? 'bg-green-500 text-white'
                      : combo.totalPrice <= searchedBudget * 1.15
                      ? 'bg-yellow-400 text-gray-900'
                      : 'bg-red-400 text-white'
                  }`}>
                    {combo.totalPrice <= searchedBudget
                      ? `เหลือ ฿${(searchedBudget - combo.totalPrice).toFixed(0)}`
                      : `เกิน ฿${(combo.totalPrice - searchedBudget).toFixed(0)}`
                    }
                  </div>
                )}
                
                {/* Image */}
                <div className="relative mt-2 sm:mt-0 px-2 sm:px-4 mb-4">
                  <div className="absolute inset-0 bg-wongnai-orange/20 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img 
                    src={combo.imageUrl} 
                    alt={combo.name} 
                    className="w-20 h-20 sm:w-28 sm:h-28 xl:w-36 xl:h-36 object-cover rounded-full shadow-2xl ring-4 ring-white/70 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative z-10" 
                  />
                </div>
                
                {/* Info */}
                <div className="text-center w-full bg-white/95 backdrop-blur-md mt-auto p-3 sm:p-4 border-t border-white/80 shadow-[0_-15px_30px_rgba(0,0,0,0.04)] transition-transform duration-300">
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-900 truncate">{combo.name}</h3>
                  <div className="flex items-center justify-center mt-1 space-x-1 text-sm sm:text-base">
                    {activeTab === 'budget' ? (
                      <span className={`font-bold ${
                        searchedBudget && combo.totalPrice > searchedBudget
                          ? 'text-red-500'
                          : 'text-wongnai-orange'
                      }`}>฿{combo.totalPrice}</span>
                    ) : (
                       <span className="font-bold text-green-500 text-xs sm:text-sm">ทำเองที่บ้าน 🏡</span>
                    )}
                  </div>
                  
                  {activeTab === 'ingredient' && combo.missingCount !== undefined ? (
                    <div className="mt-2 text-[10px] sm:text-xs text-left w-full space-y-1">
                      {combo.ownedProducts.length > 0 && (
                        <p className="text-green-600 truncate flex items-center"><CheckCircle2 className="w-3 h-3 mr-1 flex-shrink-0" /> มีแล้ว: {combo.ownedProducts.map(p => p.name).join(', ')}</p>
                      )}
                      {combo.missingProducts.length > 0 && (
                        <p className="text-red-500 font-medium truncate bg-red-50 p-1 rounded">ขาด: {combo.missingProducts.map(p => p.name).join(', ')}</p>
                      )}
                      {combo.missingProducts.length === 0 && (
                        <p className="text-green-600 font-medium truncate bg-green-50 p-1 rounded text-center">วัตถุดิบครบแล้ว! 🎉</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">
                      {activeTab === 'budget' 
                        ? combo.ingredients?.map(i => i.product?.name).join(' + ') 
                        : combo.ingredients?.map(i => i.ingredient?.name).join(' + ')}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )))}
        </div>
        
        {((activeTab === 'budget' ? combos : fridgeMenus).length > 6) && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-8 py-3 rounded-full font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm hover:-translate-y-1"
            >
              {showAll ? 'แสดงน้อยลง' : 'ดูทั้งหมด'}
            </button>
          </div>
        )}
      </div>

      {/* Combo Detail Modal via Portal */}
      {selectedCombo && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedCombo(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-100 dark:border-gray-800 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-10 max-h-[90vh] flex flex-col"
          >
            {/* Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2 z-20">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComboBookmark(selectedCombo);
                }}
                className={`p-2 backdrop-blur rounded-full transition-colors ${
                  isComboBookmarked(selectedCombo.id) 
                    ? 'bg-orange-100/80 hover:bg-orange-100 text-wongnai-orange' 
                    : 'bg-white/50 hover:bg-white dark:bg-black/50 dark:hover:bg-black text-gray-800 dark:text-white'
                }`}
              >
                <Bookmark className={`w-6 h-6 ${isComboBookmarked(selectedCombo.id) ? 'fill-wongnai-orange' : ''}`} />
              </button>
              <button 
                onClick={() => setSelectedCombo(null)}
                className="p-2 bg-white/50 hover:bg-white dark:bg-black/50 dark:hover:bg-black backdrop-blur rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-800 dark:text-white" />
              </button>
            </div>
            
            {/* Header Image */}
            <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 relative">
              <img 
                src={selectedCombo.imageUrl} 
                alt={selectedCombo.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-6 sm:p-8 space-y-6">
              {/* Title & Price/Info */}
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{selectedCombo.name}</h2>
                <div className="text-right flex-shrink-0 ml-4">
                  {activeTab === 'budget' ? (
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
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">วัตถุดิบที่ใช้</h3>
                {activeTab === 'ingredient' && selectedCombo.missingCount !== undefined ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                      <h4 className="font-bold text-green-700 dark:text-green-400 flex items-center mb-2"><CheckCircle2 className="w-4 h-4 mr-1" /> มีแล้ว</h4>
                      <ul className="list-disc pl-5 text-sm text-green-800 dark:text-green-300 space-y-1">
                        {selectedCombo.ownedProducts.map(p => <li key={p.id}>{p.name} (฿{p.price})</li>)}
                        {selectedCombo.ownedProducts.length === 0 && <li className="list-none text-gray-500">ไม่มี</li>}
                      </ul>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                      <h4 className="font-bold text-red-600 dark:text-red-400 flex items-center mb-2"><Circle className="w-4 h-4 mr-1" /> ต้องซื้อเพิ่ม</h4>
                      <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-300 space-y-1">
                        {selectedCombo.missingProducts.map(p => <li key={p.id}>{p.name} (฿{p.price})</li>)}
                        {selectedCombo.missingProducts.length === 0 && <li className="list-none text-gray-500">ไม่ต้องซื้อเพิ่ม</li>}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {selectedCombo.ingredients?.map(i => (
                      <li key={activeTab === 'budget' ? i.product?.id : i.ingredient?.id} className="flex justify-between text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg text-sm">
                        <span>{activeTab === 'budget' ? i.product?.name : i.ingredient?.name}</span>
                        {activeTab === 'budget' && <span className="font-medium">฿{i.product?.price}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Instructions */}
              {activeTab !== 'budget' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">วิธีทำ</h3>
                  <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                    {selectedCombo.description ? (
                      <div className="text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium">
                        {selectedCombo.description}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">ไม่มีวิธีทำสำหรับเมนูนี้</p>
                    )}
                  </div>
                </div>
              )}

              
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ComboSearch;
