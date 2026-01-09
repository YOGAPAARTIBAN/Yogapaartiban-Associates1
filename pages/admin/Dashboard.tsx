
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, ShieldCheck, Eye, EyeOff, Key, Wifi, WifiOff, RefreshCw, CheckCircle2, Home as HomeIcon, Info, Briefcase, Settings } from 'lucide-react';
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

  // Sync editContent with global content when it loads
  useEffect(() => {
    setEditContent(content);
  }, [content]);

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
    setSavingStatus('saving');
    try {
        updateContent(editContent);
        if (isFirebaseConnected) {
            const adminRef = getDbRef('admin_credentials');
            const lockRef = getDbRef('master_lock');
            if (lockRef) await set(lockRef, masterLock);
            if (adminRef) await set(adminRef, adminCreds);
        }
        setSavingStatus('success');
        setTimeout(() => setSavingStatus('idle'), 3000);
    } catch (e) {
        alert('Save Failed! Check connection.');
        setSavingStatus('idle');
    }
  };

  const updateNested = (section: string, key: string, value: any) => {
    setEditContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [key]: value
      }
    }));
  };

  const updateService = (id: string, field: string, value: string) => {
    setEditContent(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <h1 className="font-serif font-bold text-xl tracking-tight">Management Console</h1>
           <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${isFirebaseConnected ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
              {isFirebaseConnected ? <><Wifi size={12}/> Active Cloud Sync</> : <><WifiOff size={12}/> Offline Mode</>}
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave} 
            disabled={savingStatus === 'saving'}
            className={`${savingStatus === 'success' ? 'bg-green-600' : 'bg-amber-500 hover:bg-amber-600'} px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-all shadow-lg disabled:opacity-50 min-w-[160px] justify-center`}
          >
            {savingStatus === 'saving' ? <RefreshCw size={18} className="animate-spin" /> : savingStatus === 'success' ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {savingStatus === 'saving' ? 'Saving...' : savingStatus === 'success' ? 'Changes Saved' : 'Save All'}
          </button>
          <button onClick={() => { logout(); navigate('/official-login'); }} className="bg-white/10 hover:bg-red-600/40 px-4 py-2.5 rounded-lg text-white/80 hover:text-white transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="flex-grow container mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-white rounded-2xl shadow-md border border-slate-200 p-4 flex flex-col gap-2 h-fit md:sticky md:top-24">
            <button onClick={() => setActiveTab('general')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'general' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>
                <Settings size={18}/> General
            </button>
            <button onClick={() => setActiveTab('home')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'home' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>
                <HomeIcon size={18}/> Home Page
            </button>
            <button onClick={() => setActiveTab('about')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'about' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>
                <Info size={18}/> About Us
            </button>
            <button onClick={() => setActiveTab('services')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'services' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>
                <Briefcase size={18}/> Services
            </button>
            <div className="my-2 border-t border-slate-100"></div>
            <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'security' ? 'bg-red-600 text-white shadow-lg' : 'text-red-500 hover:bg-red-50'}`}>
                <ShieldCheck size={18}/> Security
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-md border border-slate-200 p-8">
            {activeTab === 'general' && (
                <div className="space-y-6 animate-fade-in-up">
                    <h2 className="text-2xl font-serif font-bold border-b pb-4">Firm Identity</h2>
                    <div className="grid gap-6">
                        <label className="block">
                            <span className="text-slate-500 text-xs font-bold uppercase mb-2 block">Tagline</span>
                            <input type="text" value={editContent.general.tagline} onChange={e => updateNested('general', 'tagline', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-amber-500"/>
                        </label>
                        <label className="block">
                            <span className="text-slate-500 text-xs font-bold uppercase mb-2 block">Brand Color (HEX)</span>
                            <div className="flex gap-3">
                                <input type="text" value={editContent.general.accentColor} onChange={e => updateNested('general', 'accentColor', e.target.value)} className="w-32 border border-slate-200 rounded-lg p-3 font-mono uppercase"/>
                                <div className="w-12 h-12 rounded-lg border shadow-inner" style={{backgroundColor: editContent.general.accentColor}}></div>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            {activeTab === 'home' && (
                <div className="space-y-6 animate-fade-in-up">
                    <h2 className="text-2xl font-serif font-bold border-b pb-4">Home Hero Section</h2>
                    <div className="grid gap-6">
                        <label className="block">
                            <span className="text-slate-500 text-xs font-bold uppercase mb-2 block">Main Title</span>
                            <input type="text" value={editContent.home.heroTitle} onChange={e => updateNested('home', 'heroTitle', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3"/>
                        </label>
                        <label className="block">
                            <span className="text-slate-500 text-xs font-bold uppercase mb-2 block">Hero Subtitle</span>
                            <textarea value={editContent.home.heroSubtitle} onChange={e => updateNested('home', 'heroSubtitle', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 h-24"/>
                        </label>
                        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                            <h3 className="font-bold text-amber-900 mb-4">Firm Announcement Bar</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-sm font-medium">Enabled:</span>
                                <input type="checkbox" checked={editContent.home.announcement?.enabled} onChange={e => updateNested('home', 'announcement', { ...editContent.home.announcement, enabled: e.target.checked })} className="w-5 h-5 accent-amber-600 cursor-pointer"/>
                            </div>
                            <input type="text" placeholder="Announcement text..." value={editContent.home.announcement?.text} onChange={e => updateNested('home', 'announcement', { ...editContent.home.announcement, text: e.target.value })} className="w-full border border-amber-200 rounded-lg p-3 bg-white"/>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'about' && (
                <div className="space-y-6 animate-fade-in-up">
                    <h2 className="text-2xl font-serif font-bold border-b pb-4">About the Founder</h2>
                    <div className="grid gap-6">
                        <label className="block">
                            <span className="text-slate-500 text-xs font-bold uppercase mb-2 block">Qualifications</span>
                            <input type="text" value={editContent.about.founder.qualifications} onChange={e => setEditContent(prev => ({...prev, about: {...prev.about, founder: {...prev.about.founder, qualifications: e.target.value}}}))} className="w-full border border-slate-200 rounded-lg p-3"/>
                        </label>
                        <label className="block">
                            <span className="text-slate-500 text-xs font-bold uppercase mb-2 block">Founder's Detailed Bio</span>
                            <textarea value={editContent.about.founder.bio} onChange={e => setEditContent(prev => ({...prev, about: {...prev.about, founder: {...prev.about.founder, bio: e.target.value}}}))} className="w-full border border-slate-200 rounded-lg p-3 h-64 text-sm leading-relaxed"/>
                        </label>
                    </div>
                </div>
            )}

            {activeTab === 'services' && (
                <div className="space-y-6 animate-fade-in-up">
                    <h2 className="text-2xl font-serif font-bold border-b pb-4">Practice Areas</h2>
                    <div className="grid gap-6">
                        {editContent.services.map((service) => (
                            <div key={service.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-3">
                                        <input type="text" value={service.title} onChange={e => updateService(service.id, 'title', e.target.value)} className="w-full font-bold border-b border-slate-200 bg-transparent py-1 focus:border-amber-500 outline-none"/>
                                        <textarea value={service.description} onChange={e => updateService(service.id, 'description', e.target.value)} className="w-full text-xs text-slate-600 bg-transparent h-20 outline-none"/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-10 animate-fade-in-up">
                    <h2 className="text-2xl font-serif font-bold text-red-600 border-b border-red-100 pb-4">Security Shield</h2>
                    <div className="grid gap-8">
                        <div className="bg-amber-600 p-8 rounded-2xl text-white shadow-xl">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Key size={20}/> Database Secret</h3>
                            <p className="text-amber-100 text-xs mb-4">Must match Firebase Rules (SomeRandomWord123)</p>
                            <input type="text" value={masterLock} onChange={e => setMasterLock(e.target.value)} className="w-full border-2 border-white/20 bg-white/10 rounded-xl p-4 text-white font-mono outline-none focus:bg-white/20"/>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-6">Login Credentials</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <label className="block">
                                    <span className="text-slate-400 text-[10px] font-black uppercase mb-2 block">Username</span>
                                    <input type="text" value={adminCreds.username} onChange={e => setAdminCreds(prev => ({...prev, username: e.target.value}))} className="w-full border border-slate-200 rounded-xl p-3 bg-white"/>
                                </label>
                                <label className="block">
                                    <span className="text-slate-400 text-[10px] font-black uppercase mb-2 block">Password</span>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} value={adminCreds.password} onChange={e => setAdminCreds(prev => ({...prev, password: e.target.value}))} className="w-full border border-slate-200 rounded-xl p-3 bg-white pr-12"/>
                                        <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
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
  );
};

export default Dashboard;
