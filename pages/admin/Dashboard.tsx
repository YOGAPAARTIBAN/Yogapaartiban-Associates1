import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, ShieldCheck, Eye, EyeOff, Key } from 'lucide-react';
import { set, get } from 'firebase/database';
import { INITIAL_ADMIN_CREDENTIALS } from '../../constants';

const Dashboard: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { content, updateContent, isFirebaseConnected, getDbRef } = useContent();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'general' | 'home' | 'about' | 'services' | 'security'>('general');
  const [showPassword, setShowPassword] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [adminCreds, setAdminCreds] = useState(INITIAL_ADMIN_CREDENTIALS);
  const [masterLock, setMasterLock] = useState('SomeRandomWord123'); // Default lock word

  useEffect(() => {
    if (isFirebaseConnected) {
        const adminRef = getDbRef('admin_credentials');
        if (adminRef) {
            get(adminRef).then(snap => {
                if (snap.exists()) setAdminCreds(snap.val());
            });
        }
        const lockRef = getDbRef('master_lock');
        if (lockRef) {
            get(lockRef).then(snap => {
                if (snap.exists()) setMasterLock(snap.val());
            });
        }
    }
  }, [isFirebaseConnected]);

  if (!isAuthenticated) { navigate('/official-login'); return null; }

  const handleSave = async () => {
    updateContent(editContent);
    
    // Save credentials and master lock to separate nodes
    if (isFirebaseConnected) {
        const adminRef = getDbRef('admin_credentials');
        const lockRef = getDbRef('master_lock');
        
        try {
            if (adminRef) await set(adminRef, adminCreds);
            if (lockRef) await set(lockRef, masterLock);
            alert('Settings and Security updated successfully!');
        } catch (e) {
            alert('Error saving security settings. Check your Firebase Rules.');
            console.error(e);
        }
    } else {
        alert('Changes saved locally (No Firebase Connection)');
    }
  };

  const updateNested = (section: keyof typeof content, key: string, value: string) => {
    setEditContent(prev => ({ ...prev, [section]: { ...(prev[section] as any), [key]: value } }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <h1 className="font-bold text-xl flex items-center gap-2">CMS Admin</h1>
        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded flex items-center gap-2 font-bold transition-all transform active:scale-95 shadow-lg"><Save size={18} /> Save All Changes</button>
          <button onClick={() => { logout(); navigate('/official-login'); }} className="bg-slate-700 hover:bg-red-600 px-4 py-2 rounded flex items-center gap-2 font-medium transition-colors"><LogOut size={18} /> Logout</button>
        </div>
      </div>

      <div className="flex-grow container mx-auto p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-xl min-h-[70vh] flex flex-col md:flex-row overflow-hidden border border-gray-200">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-gray-200 p-6 flex flex-col gap-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Content Sections</p>
            {(['general', 'home', 'about', 'services', 'security'] as const).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`text-left px-4 py-3 rounded-lg font-bold capitalize transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-gray-500 hover:bg-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Editor Area */}
          <div className="flex-1 p-8 overflow-y-auto max-h-[80vh]">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-fade-in-up">
                <h2 className="text-2xl font-serif font-bold text-slate-900 border-b pb-4">General Settings</h2>
                <div className="grid gap-6 max-w-2xl">
                    <label className="block">
                        <span className="text-gray-700 text-sm font-bold block mb-2">Firm Tagline</span>
                        <input type="text" value={editContent.general.tagline} onChange={e => updateNested('general', 'tagline', e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 outline-none"/>
                    </label>
                    <label className="block">
                        <span className="text-gray-700 text-sm font-bold block mb-2">Accent Color (HEX)</span>
                        <div className="flex gap-3">
                            <input type="text" value={editContent.general.accentColor} onChange={e => updateNested('general', 'accentColor', e.target.value)} className="flex-1 border border-gray-300 rounded-lg p-3 font-mono"/>
                            <div className="w-12 h-12 rounded-lg border border-gray-300 shadow-inner" style={{backgroundColor: editContent.general.accentColor}}></div>
                        </div>
                    </label>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-8 animate-fade-in-up">
                    <h2 className="text-2xl font-serif font-bold text-slate-900 border-b pb-4">Security & Access</h2>
                    
                    <div className="grid gap-8 max-w-2xl">
                        {/* Master Lock Section */}
                        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Key className="text-amber-600" size={24} />
                                <h3 className="font-bold text-amber-900">Firebase Master Lock</h3>
                            </div>
                            <p className="text-xs text-amber-700 mb-4 leading-relaxed">
                                This "Secret Word" is required by your database rules to allow any saves. 
                                It must match exactly what is in your Firebase Rules.
                            </p>
                            <input 
                                type="text" 
                                value={masterLock} 
                                onChange={e => setMasterLock(e.target.value)} 
                                className="w-full border border-amber-300 rounded-lg p-3 bg-white shadow-sm font-mono text-amber-900"
                                placeholder="Enter Secret Word"
                            />
                        </div>

                        {/* Login Credentials */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-3 mb-6">
                                <ShieldCheck className="text-slate-900" size={24} />
                                <h3 className="font-bold text-slate-900">Admin Login Credentials</h3>
                            </div>
                            <div className="grid gap-6">
                                <label className="block">
                                    <span className="text-gray-600 text-xs font-bold uppercase mb-2 block">Username</span>
                                    <input type="text" value={adminCreds.username} onChange={e => setAdminCreds(prev => ({...prev, username: e.target.value}))} className="w-full border border-gray-300 rounded-lg p-3 bg-white"/>
                                </label>
                                <label className="block">
                                    <span className="text-gray-600 text-xs font-bold uppercase mb-2 block">Password</span>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} value={adminCreds.password} onChange={e => setAdminCreds(prev => ({...prev, password: e.target.value}))} className="w-full border border-gray-300 rounded-lg p-3 bg-white pr-12"/>
                                        <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-slate-900 transition-colors">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;