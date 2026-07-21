import React, { useState, useEffect } from 'react';
import { Users, FileText, Utensils, Trash2, ShieldAlert, Plus, X, Edit2, Package, ChevronDown, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = '/api/admin';

// ===================== MODAL =====================
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800 z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-bold dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

// ===================== COMBO FORM MODAL =====================
function ComboFormModal({ combo, onClose, onSave, products }) {
  const isEdit = !!combo;
  const [form, setForm] = useState(
    isEdit
      ? {
          name: combo.name,
          description: combo.description || '',
          totalPrice: combo.totalPrice,
          imageUrl: combo.imageUrl || '',
          productIds: combo.ingredients?.map(i => i.productId) || []
        }
      : { name: '', description: '', totalPrice: '', imageUrl: '', productIds: [] }
  );

  const toggle = (id) => {
    setForm(prev => ({
      ...prev,
      productIds: prev.productIds.includes(id)
        ? prev.productIds.filter(p => p !== id)
        : [...prev.productIds, id]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${API}/combos/${combo.id}` : `${API}/combos`;
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    }).then(r => r.json()).then(() => { onSave(); onClose(); }).catch(console.error);
  };

  return (
    <Modal title={isEdit ? 'แก้ไขเมนูคอมโบ' : 'เพิ่มเมนูคอมโบใหม่'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อเมนูคอมโบ *</label>
          <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all"
            placeholder="เช่น ข้าวไข่ตุ๋น + น้ำเต้าหู้" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">คำอธิบาย</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all resize-none h-20"
            placeholder="อธิบายสั้นๆ..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ราคารวม (฿) *</label>
            <input required type="number" step="0.5" value={form.totalPrice} onChange={e => setForm({...form, totalPrice: e.target.value})}
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all"
              placeholder="50" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">URL รูปภาพ</label>
            <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})}
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all"
              placeholder="https://..." />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">เลือกวัตถุดิบ</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {products.map(p => (
              <button key={p.id} type="button" onClick={() => toggle(p.id)}
                className={`text-left px-3 py-2 rounded-xl border text-sm transition-all ${form.productIds.includes(p.id) ? 'border-wongnai-orange bg-orange-50 dark:bg-orange-900/30 text-wongnai-orange font-medium' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:border-gray-300'}`}>
                {p.name} <span className="text-xs text-gray-400">฿{p.price}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex space-x-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium">ยกเลิก</button>
          <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-wongnai-orange text-white font-medium hover:bg-orange-600 transition-all shadow-md shadow-orange-500/30">บันทึก</button>
        </div>
      </form>
    </Modal>
  );
}

// ===================== PRODUCT FORM MODAL =====================
function ProductFormModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || { name: '', price: '', category: 'อาหาร', imageUrl: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = product ? 'PUT' : 'POST';
    const url = product ? `${API}/products/${product.id}` : `${API}/products`;
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    }).then(r => r.json()).then(() => { onSave(); onClose(); }).catch(console.error);
  };

  return (
    <Modal title={product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อสินค้า *</label>
          <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all"
            placeholder="เช่น ข้าวสวย" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ราคา (฿) *</label>
            <input required type="number" step="0.5" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all"
              placeholder="25" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">หมวดหมู่</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all">
              <option>อาหาร</option>
              <option>เครื่องดื่ม</option>
              <option>ขนม</option>
              <option>เครื่องปรุง</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">URL รูปภาพ</label>
          <input value={form.imageUrl || ''} onChange={e => setForm({...form, imageUrl: e.target.value})}
            className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-wongnai-orange/50 transition-all"
            placeholder="https://..." />
        </div>
        <div className="flex space-x-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium">ยกเลิก</button>
          <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-wongnai-orange text-white font-medium hover:bg-orange-600 transition-all shadow-md shadow-orange-500/30">บันทึก</button>
        </div>
      </form>
    </Modal>
  );
}

// ===================== MAIN DASHBOARD =====================
function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('combos');
  const [stats, setStats] = useState({ userCount: 0, postCount: 0, comboCount: 0, productCount: 0 });
  const [combos, setCombos] = useState([]);
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null); // null | 'addCombo' | 'addProduct' | {type:'editProduct', product}
  
  const fetchAll = () => {
    fetch(`${API}/stats`).then(r => r.json()).then(setStats).catch(console.error);
    fetch(`${API}/combos`).then(r => r.json()).then(setCombos).catch(console.error);
    fetch(`${API}/products`).then(r => r.json()).then(setProducts).catch(console.error);
    fetch(`${API}/posts`).then(r => r.json()).then(setPosts).catch(console.error);
    fetch(`${API}/comments`).then(r => r.json()).then(setComments).catch(console.error);
    fetch(`${API}/users`).then(r => r.json()).then(setUsers).catch(console.error);
  };

  useEffect(() => { fetchAll(); }, []);

  const deleteCombo = (id) => {
    if (!window.confirm('ลบคอมโบนี้ใช่ไหม?')) return;
    fetch(`${API}/combos/${id}`, { method: 'DELETE' }).then(() => fetchAll()).catch(console.error);
  };

  const deleteProduct = (id) => {
    if (!window.confirm('ลบสินค้านี้ใช่ไหม?')) return;
    fetch(`${API}/products/${id}`, { method: 'DELETE' }).then(() => fetchAll()).catch(console.error);
  };

  const deletePost = (id) => {
    if (!window.confirm('ลบโพสต์นี้ใช่ไหม?')) return;
    fetch(`${API}/posts/${id}`, { method: 'DELETE' }).then(() => fetchAll()).catch(console.error);
  };

  const unbanUser = (id) => {
    if (!window.confirm('ปลดแบนให้ผู้ใช้นี้ใช่ไหม?')) return;
    fetch(`${API}/users/${id}/unban`, { method: 'POST' }).then(() => fetchAll()).catch(console.error);
  };

  const deleteUser = (id) => {
    if (!window.confirm('ลบบัญชีผู้ใช้นี้ถาวร รวมถึงโพสต์และคอมเมนต์ทั้งหมดใช่ไหม?')) return;
    fetch(`${API}/users/${id}`, { method: 'DELETE' }).then(() => fetchAll()).catch(console.error);
  };

  const tabs = [
    { id: 'combos', label: 'เมนูคอมโบ', icon: Utensils },
    { id: 'products', label: 'วัตถุดิบ', icon: Package },
    { id: 'posts', label: 'โพสต์ชุมชน', icon: FileText },
    { id: 'ban_history', label: 'ประวัติการแบน', icon: ShieldAlert },
    { id: 'users', label: 'ผู้ใช้งาน', icon: Users },
  ];

  const bannedUsers = users.filter(u => u.commentBanUntil && new Date(u.commentBanUntil) > new Date());

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">การเข้าถึงถูกปฏิเสธ</h2>
        <p className="text-gray-500 dark:text-gray-400">เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าหน้านี้ได้</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">ระบบจัดการหลังบ้าน Ginraide</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'สมาชิก', value: stats.userCount, icon: Users, color: 'blue' },
          { label: 'โพสต์', value: stats.postCount, icon: FileText, color: 'green' },
          { label: 'คอมโบ', value: stats.comboCount, icon: Utensils, color: 'orange' },
          { label: 'วัตถุดิบ', value: stats.productCount, icon: Package, color: 'purple' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${color === 'blue' ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/30' : color === 'green' ? 'bg-green-50 text-green-500 dark:bg-green-900/30' : color === 'orange' ? 'bg-orange-50 text-wongnai-orange dark:bg-orange-900/30' : 'bg-purple-50 text-purple-500 dark:bg-purple-900/30'}`}>
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all border-b-2 ${activeTab === id ? 'border-wongnai-orange text-wongnai-orange' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ---- COMBOS TAB ---- */}
        {activeTab === 'combos' && (
          <div>
            <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex justify-end">
              <button onClick={() => setModal('addCombo')}
                className="flex items-center space-x-2 bg-wongnai-orange text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-600 transition-all shadow-md shadow-orange-500/30 text-sm">
                <Plus className="w-4 h-4" /><span>เพิ่มคอมโบใหม่</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
                  <tr>
                    {['ID', 'ชื่อคอมโบ', 'วัตถุดิบ', 'ราคา', 'จัดการ'].map(h => (
                      <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                  {combos.map(combo => (
                    <tr key={combo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">#{combo.id}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{combo.name}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{combo.ingredients?.map(i => i.product.name).join(', ')}</td>
                      <td className="px-6 py-4 text-wongnai-orange font-bold">฿{combo.totalPrice}</td>
                      <td className="px-6 py-4 flex items-center space-x-2">
                        <button onClick={() => setModal({ type: 'editCombo', combo })}
                          className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 p-2 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteCombo(combo.id)}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-2 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {combos.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">ไม่มีข้อมูล</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- PRODUCTS TAB ---- */}
        {activeTab === 'products' && (
          <div>
            <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex justify-end">
              <button onClick={() => setModal('addProduct')}
                className="flex items-center space-x-2 bg-wongnai-orange text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-600 transition-all shadow-md shadow-orange-500/30 text-sm">
                <Plus className="w-4 h-4" /><span>เพิ่มสินค้าใหม่</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
                  <tr>
                    {['ID', 'ชื่อสินค้า', 'หมวดหมู่', 'ราคา', 'จัดการ'].map(h => (
                      <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">#{product.id}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{product.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-xs">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 text-wongnai-orange font-bold">฿{product.price}</td>
                      <td className="px-6 py-4 flex items-center space-x-2">
                        <button onClick={() => setModal({ type: 'editProduct', product })}
                          className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 p-2 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-2 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">ไม่มีข้อมูล</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- POSTS MODERATION TAB ---- */}
        {activeTab === 'posts' && (
          <div>
            <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">กดลบเพื่อนำโพสต์ที่ไม่เหมาะสมออกจากระบบ</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
                  <tr>
                    {['ID', 'ชื่อเรื่อง', 'โดย', 'ไลก์', 'คอมเมนต์', 'จัดการ'].map(h => (
                      <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                  {posts.map(post => (
                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">#{post.id}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white max-w-[200px] truncate">
                        <Link to={`/#post-${post.id}`} className="hover:text-wongnai-orange transition-colors">
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">@{post.author.username}</td>
                      <td className="px-6 py-4 text-red-500 font-medium">❤️ {post.likesCount}</td>
                      <td className="px-6 py-4 text-blue-500 font-medium">💬 {post._count.comments}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => deletePost(post.id)}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-2 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">ไม่มีโพสต์</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- USERS TAB ---- */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
                <tr>
                  {['ID', 'Username', 'สิทธิ์', 'โพสต์', 'สมัครเมื่อ', 'จัดการ'].map(h => (
                    <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                {users.map(userItem => (
                  <tr key={userItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">#{userItem.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">@{userItem.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${userItem.role === 'ADMIN' ? 'bg-orange-100 dark:bg-orange-900/30 text-wongnai-orange' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                        {userItem.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{userItem._count.posts} โพสต์</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">{new Date(userItem.createdAt).toLocaleDateString('th-TH')}</td>
                    <td className="px-6 py-4">
                      {userItem.id !== user.id && (
                        <button onClick={() => deleteUser(userItem.id)} title="ลบผู้ใช้นี้ทิ้งถาวร"
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-2 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">ไม่มีผู้ใช้</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ---- BAN HISTORY TAB ---- */}
        {activeTab === 'ban_history' && (
          <div>
            <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">รายชื่อผู้ใช้ที่กำลังถูกแบนสิทธิ์การพิมพ์คอมเมนต์</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
                  <tr>
                    {['ID', 'Username', 'แบนถึงวันที่', 'โพสต์', 'จัดการ'].map(h => (
                      <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                  {bannedUsers.map(bu => (
                    <tr key={bu.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">#{bu.id}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">@{bu.username}</td>
                      <td className="px-6 py-4 text-red-500 font-medium">
                        {new Date(bu.commentBanUntil).toLocaleDateString('th-TH')} เวลา {new Date(bu.commentBanUntil).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})} น.
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{bu._count.posts} โพสต์</td>
                      <td className="px-6 py-4">
                        <button onClick={() => unbanUser(bu.id)}
                          className="text-green-600 hover:text-white bg-green-50 hover:bg-green-500 dark:bg-green-900/20 dark:hover:bg-green-600 p-2 rounded-lg transition-colors border border-green-200 dark:border-green-800 font-bold text-xs">
                          ปลดแบน
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bannedUsers.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">ไม่มีผู้ใช้ที่ถูกแบน</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {modal === 'addCombo' && (
          <ComboFormModal products={products} onClose={() => setModal(null)} onSave={fetchAll} />
        )}
        {modal?.type === 'editCombo' && (
          <ComboFormModal combo={modal.combo} products={products} onClose={() => setModal(null)} onSave={fetchAll} />
        )}
        {(modal === 'addProduct' || modal?.type === 'editProduct') && (
          <ProductFormModal
            product={modal?.type === 'editProduct' ? modal.product : null}
            onClose={() => setModal(null)}
            onSave={fetchAll}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;
