import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, CheckCircle2, Circle, X } from 'lucide-react';
import { motion } from 'framer-motion';

function ComboSearch() {
  const [budget, setBudget] = useState('');
  const [searchedBudget, setSearchedBudget] = useState(null); // track what was actually searched
  const [activeTab, setActiveTab] = useState('budget'); // 'budget' or 'ingredient'
  const [combos, setCombos] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedCombo, setSelectedCombo] = useState(null);

  // Fetch combos and products on mount
  useEffect(() => {
    fetch('/api/combos')
      .then(res => res.json())
      .then(data => setCombos(data))
      .catch(err => console.error(err));

    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);



  const toggleIngredient = (id) => {
    setSelectedIngredients(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleIngredientSearch = () => {
    fetch('/api/combos/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIngredients: selectedIngredients })
    })
      .then(res => res.json())
      .then(data => setCombos(data))
      .catch(err => console.error(err));
  };

  const handleBudgetSearch = () => {
    fetch(`/api/combos?maxBudget=${budget}`)
      .then(res => res.json())
      .then(data => {
        setCombos(data);
        setSearchedBudget(parseFloat(budget)); // remember what budget was searched
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          ค้นหา <span className="text-wongnai-orange">คอมโบอาหาร</span> ที่ใช่สำหรับคุณ
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-200 max-w-2xl mx-auto">
          อิ่มอร่อยคุ้มค่าด้วยเมนูเด็ดจากร้านสะดวกซื้อ ไม่ว่าจะค้นหาจากงบประมาณ หรือวัตถุดิบที่คุณมีอยู่แล้ว
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center space-x-4">
        <button 
          onClick={() => setActiveTab('budget')}
          className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === 'budget' ? 'bg-wongnai-orange text-white shadow-xl shadow-orange-500/40 -translate-y-1 scale-105' : 'bg-white text-gray-600 hover:bg-orange-50 hover:-translate-y-0.5'}`}
        >
          ค้นหาจากงบประมาณ
        </button>
        <button 
          onClick={() => setActiveTab('ingredient')}
          className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === 'ingredient' ? 'bg-wongnai-orange text-white shadow-xl shadow-orange-500/40 -translate-y-1 scale-105' : 'bg-white text-gray-600 hover:bg-orange-50 hover:-translate-y-0.5'}`}
        >
          ค้นหาจากวัตถุดิบที่มี
        </button>
      </div>

      {/* Search Bar (Budget) */}
      {activeTab === 'budget' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto flex space-x-2"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-500 font-medium">฿</span>
            </div>
            <input 
              type="number" 
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="งบประมาณของคุณ (เช่น 50)" 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-wongnai-orange focus:ring-2 focus:ring-orange-200 transition-all outline-none text-lg"
            />
          </div>
          <button 
            onClick={handleBudgetSearch}
            className="bg-gray-900 text-white px-6 rounded-xl hover:bg-gray-800 transition-colors flex items-center font-medium"
          >
            <Search className="w-5 h-5 mr-2" />
            ค้นหา
          </button>
        </motion.div>
      )}

      {/* Ingredient Selector */}
      {activeTab === 'ingredient' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors"
        >
          <h3 className="text-lg font-bold mb-4 dark:text-white">เลือกวัตถุดิบที่คุณมีอยู่แล้ว</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => toggleIngredient(product.id)}
                className={`flex items-center p-3 rounded-xl border transition-all ${
                  selectedIngredients.includes(product.id) 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-200'
                }`}
              >
                {selectedIngredients.includes(product.id) ? (
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 mr-2 text-gray-400" />
                )}
                <span className="text-sm font-medium">{product.name}</span>
              </button>
            ))}
            {products.length === 0 && <p className="text-gray-500 dark:text-gray-400 col-span-full">กำลังโหลดวัตถุดิบ...</p>}
          </div>
          <div className="flex justify-center">
            <button 
              onClick={handleIngredientSearch}
              className="bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center font-medium shadow-lg"
            >
              <Search className="w-5 h-5 mr-2" />
              ค้นหาเมนูคอมโบ
            </button>
          </div>
        </motion.div>
      )}

      {/* Results Grid */}
      <div className="pt-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">เมนูคอมโบแนะนำ</h2>
            {searchedBudget && activeTab === 'budget' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ค้นหาใกล้เคียงงบ <span className="font-bold text-wongnai-orange">฿{searchedBudget}</span> — เรียงจากใกล้ที่สุดไปหางที่สุด
              </p>
            )}
          </div>
          <button className="text-wongnai-orange font-medium flex items-center hover:underline text-sm">
            จัดเรียงตามยอดนิยม <ChevronDown className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {combos.map((combo, index) => (
            <motion.div 
              key={combo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedCombo(combo)}
            >
              <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-6 aspect-[4/5] flex flex-col items-center justify-center relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Official Badge */}
                {combo.isOfficial && (
                  <div className="absolute top-4 left-4 bg-white/80 backdrop-blur text-wongnai-orange text-xs font-bold px-2 py-1 rounded-md">
                    OFFICIAL
                  </div>
                )}

                {/* Budget Diff Badge (only shown when searching by budget) */}
                {activeTab === 'budget' && searchedBudget && (
                  <div className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-full ${
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
                <img 
                  src={combo.imageUrl} 
                  alt={combo.name} 
                  className="w-40 h-40 object-cover rounded-full shadow-lg group-hover:scale-110 transition-transform duration-500 mb-6" 
                />
                
                {/* Info */}
                <div className="text-center w-full bg-white/90 backdrop-blur-sm absolute bottom-0 left-0 right-0 p-4 border-t border-white/50">
                  <h3 className="font-bold text-gray-900 dark:text-gray-900 truncate">{combo.name}</h3>
                  <div className="flex items-center justify-center mt-1 space-x-1">
                    <span className={`font-bold ${
                      activeTab === 'budget' && searchedBudget && combo.totalPrice > searchedBudget
                        ? 'text-red-500'
                        : 'text-wongnai-orange'
                    }`}>฿{combo.totalPrice}</span>
                  </div>
                  
                  {activeTab === 'ingredient' && combo.missingCount !== undefined ? (
                    <div className="mt-2 text-xs text-left w-full space-y-1">
                      {combo.ownedProducts.length > 0 && (
                        <p className="text-green-600 truncate flex items-center"><CheckCircle2 className="w-3 h-3 mr-1 flex-shrink-0" /> มีแล้ว: {combo.ownedProducts.map(p => p.name).join(', ')}</p>
                      )}
                      {combo.missingProducts.length > 0 && (
                        <p className="text-red-500 font-medium truncate bg-red-50 p-1 rounded">ต้องซื้อเพิ่ม: {combo.missingProducts.map(p => p.name).join(', ')}</p>
                      )}
                      {combo.missingProducts.length === 0 && (
                        <p className="text-green-600 font-medium truncate bg-green-50 p-1 rounded text-center">วัตถุดิบครบแล้ว! 🎉</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1 truncate">{combo.ingredients?.map(i => i.product.name).join(' + ')}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
            className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-100 dark:border-gray-800 overflow-y-auto z-10 max-h-[90vh] flex flex-col"
          >
            {/* Close button */}
            <button 
              onClick={() => setSelectedCombo(null)}
              className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white dark:bg-black/50 dark:hover:bg-black backdrop-blur rounded-full transition-colors z-20"
            >
              <X className="w-6 h-6 text-gray-800 dark:text-white" />
            </button>
            
            {/* Header Image */}
            <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 relative">
              <img 
                src={selectedCombo.imageUrl} 
                alt={selectedCombo.name} 
                className="w-full h-full object-cover"
              />
              {selectedCombo.isOfficial && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-wongnai-orange text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  OFFICIAL
                </div>
              )}
            </div>
            
            <div className="p-6 sm:p-8 space-y-6">
              {/* Title & Price */}
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{selectedCombo.name}</h2>
                <div className="text-right flex-shrink-0 ml-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400 block">ราคารวม</span>
                  <span className="text-2xl font-black text-wongnai-orange">฿{selectedCombo.totalPrice}</span>
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
                      <li key={i.product.id} className="flex justify-between text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg text-sm">
                        <span>{i.product.name}</span>
                        <span className="font-medium">฿{i.product.price}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Instructions */}
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
              
              <div className="pt-4 flex justify-end border-t border-gray-100 dark:border-gray-800">
                <button 
                  onClick={() => setSelectedCombo(null)}
                  className="bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ComboSearch;
