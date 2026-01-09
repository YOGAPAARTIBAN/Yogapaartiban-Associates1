import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, ShieldCheck, Eye, EyeOff, Key, Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
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
  const [masterLock, setMasterLock] = useState('SomeRandomWord123');
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  useEffect(() => {
    if (isFirebaseConnected) {
        // Fetch Admin Credentials
        const adminRef = getDbRef('admin_credentials');
        if (adminRef) {
            get(adminRef).then(snap => {
                if (snap.exists()) setAdminCreds(snap.val());
                else {
                    // Fallback to reading from content node if that's where they were
                    const legacy = (content as any).credentials;
                    if (legacy) setAdminCreds(legacy);
                }
            });
        }
        // Fetch Master Lock
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
    setSavingStatus('saving');
    try {
        // 1. Update Content
        updateContent(editContent);
        
        // 2. Sync Security Nodes
        if (isFirebaseConnected) {
            const adminRef = getDbRef('admin_credentials');
            const lockRef = getDbRef('master_lock');
            
            // We must write the lock first to satisfy the write rules
            if (lockRef) await set(lockRef, masterLock);
            if (adminRef) await set(adminRef, adminCreds);
        }
        
        setSavingStatus('success');
        setTimeout(() => setSavingStatus('idle'), 3000);
    } catch (e) {
        alert('Save Failed! Check if your "Master Lock" matches your Firebase Rules.');
        console.error(e);
        setSavingStatus('idle');
    }
  };

  const updateNested = (section: keyof typeof content, key: string, value: string) => {
    setEditContent(prev => ({ ...prev, [section]: { ...(prev[section] as any), [section === 'services' ? '' : key]: value } }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <h1 className="font-serif font-bold text-xl tracking-tight">Admin Dashboard</h1>
           <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isFirebaseConnected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {isFirebaseConnected ? <><Wifi size={12}/> Live Sync Active</> : <><WifiOff size={12}/> Local Mode Only</>}
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave} 
            disabled={savingStatus === 'saving'}
            className={`${savingStatus === 'success' ? 'bg-green-600' : 'bg-amber-500 hover:bg-amber-600'} px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-all transform active:scale-95 shadow-lg disabled:opacity-50 min-w-[160px] justify-center`}
          >
            {savingStatus === 'saving' ? <RefreshCw size={18} className="animate-spin" /> : savingStatus === 'success' ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {savingStatus === 'saving' ? 'Syncing...' : savingStatus === 'success' ? 'All Saved!' : 'Save Changes'}
          </button>
          <button onClick={() => { logout(); navigate('/official-login'); }} className="bg-white/10 hover:bg-red-600/20 text-white/70 hover:text-red-400 px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all border border-white/10">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="flex-grow container mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-2xl min-h-[75vh] flex flex-col md:flex-row overflow-hidden border border-slate-200">
          {/* Sidebar */}
          <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 p-8 flex flex-col gap-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Management Console</p>
            {(['general', 'home', 'about', 'services', 'security'] as const).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`text-left px-5 py-4 rounded-xl font-bold capitalize transition-all flex items-center justify-between group ${activeTab === tab ? 'bg-slate-900 text-white shadow-xl translate-x-2' : 'text-slate-500 hover:bg-slate-200/50'}`}
              >
                {tab}
                {activeTab === tab && <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>}
              </button>
            ))}
            
            <div className="mt-auto pt-8 border-t border-slate-200">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-[10px] text-amber-800 font-bold uppercase mb-1">Database Info</p>
                    <p className="text-[9px] text-amber-600 font-mono break-all opacity-70">yogapaartiban-web-default-rtdb</p>
                </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 p-10 overflow-y-auto max-h-[80vh] scrollbar-hide">
            {activeTab === 'general' && (
              <div className="space-y-10 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <h2 className="text-3xl font-serif font-bold text-slate-900">General Identity</h2>
                </div>
                
                <div className="grid gap-8 max-w-3xl">
                    <div className="group">
                        <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-3 group-focus-within:text-amber-600 transition-colors">Firm Slogan / Tagline</label>
                        <input type="text" value={editContent.general.tagline} onChange={e => updateNested('general', 'tagline', e.target.value)} className="w-full border-2 border-slate-100 rounded-xl p-4 focus:border-amber-500 outline-none transition-all text-slate-800 font-medium shadow-sm"/>
                    </div>
                    <div className="group">
                        <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-3 group-focus-within:text-amber-600 transition-colors">Brand Accent Color</label>
                        <div className="flex gap-4">
                            <input type="text" value={editContent.general.accentColor} onChange={e => updateNested('general', 'accentColor', e.target.value)} className="flex-1 border-2 border-slate-100 rounded-xl p-4 font-mono shadow-sm"/>
                            <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-2xl transition-transform hover:scale-110" style={{backgroundColor: editContent.general.accentColor}}></div>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-10 animate-fade-in-up">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                        <h2 className="text-3xl font-serif font-bold text-slate-900">Security Shield</h2>
                        <ShieldCheck className="text-slate-300" size={32} />
                    </div>
                    
                    <div className="grid gap-8 max-w-3xl">
                        {/* Master Lock Section */}
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-8 rounded-2xl shadow-xl shadow-amber-500/20 text-white">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-white/20 p-2.5 rounded-lg"><Key size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-lg">Firebase Database Key</h3>
                                    <p className="text-white/70 text-xs font-medium">This must match your Firebase Rule "SomeRandomWord123"</p>
                                </div>
                            </div>
                            <input 
                                type="text" 
                                value={masterLock} 
                                onChange={e => setMasterLock(e.target.value)} 
                                className="w-full border-2 border-white/20 bg-white/10 rounded-xl p-4 text-white placeholder:text-white/40 focus:bg-white/20 outline-none font-mono text-xl tracking-wider transition-all"
                                placeholder="Enter Secret Word"
                            />
                        </div>

                        {/* Login Credentials */}
                        <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-100 shadow-inner">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <ShieldCheck className="text-amber-500" size={20} />
                                Access Credentials
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Username</label>
                                    <input type="text" value={adminCreds.username} onChange={e => setAdminCreds(prev => ({...prev, username: e.target.value}))} className="w-full border border-slate-200 rounded-xl p-3.5 bg-white shadow-sm focus:border-amber-500 transition-all outline-none font-medium"/>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Password</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} value={adminCreds.password} onChange={e => setAdminCreds(prev => ({...prev, password: e.target.value}))} className="w-full border border-slate-200 rounded-xl p-3.5 bg-white shadow-sm focus:border-amber-500 transition-all outline-none font-medium pr-12"/>
                                        <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-slate-900 transition-colors">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-6 text-[11px] text-slate-400 italic">Changing these will update your login for the next time you sign in.</p>
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