import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { useNavigate } from 'react-router-dom';
import { 
  Save, LogOut, ShieldCheck, Eye, EyeOff, Key, Wifi, WifiOff, 
  RefreshCw, CheckCircle2, Home as HomeIcon, Info, Briefcase, 
  Settings, AlertTriangle, User, Users, Plus, Trash2, 
  Video, Phone, Mail, MapPin, Image as ImageIcon, AlertCircle
} from 'lucide-react';
import { set, get } from 'firebase/database';
import { INITIAL_ADMIN_CREDENTIALS, INITIAL_CONTENT } from '../../constants';
import { TeamMember, Service } from '../../types';

const Dashboard: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { content, updateContent, isFirebaseConnected, getDbRef } = useContent();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'general' | 'home' | 'about' | 'services' | 'security'>('general');
  const [showPassword, setShowPassword] = useState(false);
  const [editContent, setEditContent] = useState(content || INITIAL_CONTENT);
  const [adminCreds, setAdminCreds] = useState(INITIAL_ADMIN_CREDENTIALS);
  const [masterLock, setMasterLock] = useState('SomeRandomWord123');
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  // Initialization & Sync
  useEffect(() => {
    if (content) {
      // Deep merge with defaults to prevent UI gaps
      setEditContent({
        ...INITIAL_CONTENT,
        ...content,
        general: { ...INITIAL_CONTENT.general, ...(content.general || {}) },
        home: { ...INITIAL_CONTENT.home, ...(content.home || {}) },
        about: { 
          ...INITIAL_CONTENT.about, 
          ...(content.about || {}),
          founder: { ...INITIAL_CONTENT.about.founder, ...(content.about?.founder || {}) },
          executives: Array.isArray(content.about?.executives) ? content.about.executives : Object.values(content.about?.executives || {}),
          cas: Array.isArray(content.about?.cas) ? content.about.cas : Object.values(content.about?.cas || {})
        },
        services: Array.isArray(content.services) ? content.services : Object.values(content.services || {}),
        disclaimer: { ...INITIAL_CONTENT.disclaimer, ...(content.disclaimer || {}) }
      });
    }
  }, [content]);

  useEffect(() => {
    if (isFirebaseConnected) {
        const adminRef = getDbRef('admin_credentials');
        if (adminRef) get(adminRef).then(snap => snap.exists() && setAdminCreds(snap.val()));
        const lockRef = getDbRef('master_lock');
        if (lockRef) get(lockRef).then(snap => snap.exists() && setMasterLock(snap.val()));
    }
  }, [isFirebaseConnected, getDbRef]);

  if (!isAuthenticated) { navigate('/official-login'); return null; }

  // Actions
  const handleSave = async () => {
    setSavingStatus('saving');
    try {
        await updateContent(editContent);
        if (isFirebaseConnected) {
            const adminRef = getDbRef('admin_credentials');
            const lockRef = getDbRef('master_lock');
            if (lockRef) await set(lockRef, masterLock);
            if (adminRef) await set(adminRef, adminCreds);
        }
        setSavingStatus('success');
        setTimeout(() => setSavingStatus('idle'), 3000);
    } catch (e) {
        alert('Save Failed!');
        setSavingStatus('idle');
    }
  };

  const updateNested = (section: string, key: string, value: any) => {
    setEditContent(prev => ({
      ...prev,
      [section]: { ...(prev[section as keyof typeof prev] as any), [key]: value }
    }));
  };

  const updateArrayItem = (path: 'services' | 'about.executives' | 'about.cas', id: string, field: string, value: any) => {
    setEditContent(prev => {
      const newState = { ...prev };
      if (path === 'services') {
        newState.services = prev.services.map(s => s.id === id ? { ...s, [field]: value } : s);
      } else if (path === 'about.executives') {
        newState.about.executives = prev.about.executives.map(e => e.id === id ? { ...e, [field]: value } : e);
      } else if (path === 'about.cas') {
        newState.about.cas = prev.about.cas.map(c => c.id === id ? { ...c, [field]: value } : c);
      }
      return newState;
    });
  };

  const addItem = (path: 'services' | 'executives' | 'cas') => {
    const id = Date.now().toString();
    setEditContent(prev => {
      if (path === 'services') return { ...prev, services: [...prev.services, { id, title: 'New Service', description: '', iconName: 'Briefcase' }] };
      if (path === 'executives') return { ...prev, about: { ...prev.about, executives: [...prev.about.executives, { id, name: 'New Executive', role: 'Advocate', bio: '' }] } };
      return { ...prev, about: { ...prev.about, cas: [...prev.about.cas, { id, name: 'New CA', role: 'Chartered Accountant', bio: '' }] } };
    });
  };

  const removeItem = (path: 'services' | 'executives' | 'cas', id: string) => {
    setEditContent(prev => {
      if (path === 'services') return { ...prev, services: prev.services.filter(s => s.id !== id) };
      if (path === 'executives') return { ...prev, about: { ...prev.about, executives: prev.about.executives.filter(e => e.id !== id) } };
      return { ...prev, about: { ...prev.about, cas: prev.about.cas.filter(c => c.id !== id) } };
    });
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
          <button onClick={handleSave} disabled={savingStatus === 'saving'} className={`${savingStatus === 'success' ? 'bg-green-600' : 'bg-amber-500 hover:bg-amber-600'} px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-all shadow-lg min-w-[160px] justify-center`}>
            {savingStatus === 'saving' ? <RefreshCw size={18} className="animate-spin" /> : savingStatus === 'success' ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {savingStatus === 'saving' ? 'Saving...' : savingStatus === 'success' ? 'Changes Saved' : 'Save All Changes'}
          </button>
          <button onClick={() => { logout(); navigate('/official-login'); }} className="bg-white/10 hover:bg-red-600/40 px-4 py-2.5 rounded-lg text-white/80 hover:text-white transition-all"><LogOut size={18} /></button>
        </div>
      </div>

      <div className="flex-grow container mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-72 bg-white rounded-2xl shadow-md border border-slate-200 p-4 flex flex-col gap-2 h-fit md:sticky md:top-24">
            <button onClick={() => setActiveTab('general')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'general' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}><Settings size={18}/> General Identity</button>
            <button onClick={() => setActiveTab('home')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'home' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}><HomeIcon size={18}/> Home & Warnings</button>
            <button onClick={() => setActiveTab('about')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'about' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}><User size={18}/> Team & Founder</button>
            <button onClick={() => setActiveTab('services')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'services' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}><Briefcase size={18}/> Practice Areas</button>
            <div className="my-2 border-t border-slate-100"></div>
            <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'security' ? 'bg-red-600 text-white shadow-lg' : 'text-red-500 hover:bg-red-50'}`}><ShieldCheck size={18}/> Security</button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 space-y-8 pb-20">
            {/* TAB: GENERAL */}
            {activeTab === 'general' && (
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden animate-fade-in-up">
                    <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center gap-3"><Settings className="text-slate-400" /> <h2 className="font-serif font-bold text-xl">General Firm Identity</h2></div>
                    <div className="p-8 grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <label className="block"><span className="text-slate-500 text-[10px] font-black uppercase mb-2 block">Phone Number</span><div className="relative"><Phone className="absolute left-3 top-3.5 text-slate-300" size={16}/><input type="text" value={editContent.general.phone || ''} onChange={e => updateNested('general', 'phone', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 pl-10"/></div></label>
                            <label className="block"><span className="text-slate-500 text-[10px] font-black uppercase mb-2 block">Email Address</span><div className="relative"><Mail className="absolute left-3 top-3.5 text-slate-300" size={16}/><input type="email" value={editContent.general.email || ''} onChange={e => updateNested('general', 'email', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 pl-10"/></div></label>
                        </div>
                        <label className="block"><span className="text-slate-500 text-[10px] font-black uppercase mb-2 block">Main Office Address</span><div className="relative"><MapPin className="absolute left-3 top-3.5 text-slate-300" size={16}/><textarea value={editContent.general.address || ''} onChange={e => updateNested('general', 'address', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 pl-10 h-20"/></div></label>
                        <label className="block"><span className="text-slate-500 text-[10px] font-black uppercase mb-2 block">Hero Background Image URL</span><div className="relative"><ImageIcon className="absolute left-3 top-3.5 text-slate-300" size={16}/><input type="text" value={editContent.general.heroImage || ''} onChange={e => updateNested('general', 'heroImage', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 pl-10"/></div></label>
                    </div>
                </div>
            )}

            {/* TAB: HOME */}
            {activeTab === 'home' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center gap-3"><HomeIcon className="text-slate-400" /> <h2 className="font-serif font-bold text-xl">Home Page Hero</h2></div>
                        <div className="p-8 space-y-6">
                            <label className="block"><span className="text-slate-500 text-[10px] font-black uppercase mb-2 block">Hero Main Title</span><input type="text" value={editContent.home.heroTitle || ''} onChange={e => updateNested('home', 'heroTitle', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 font-bold"/></label>
                            <label className="block"><span className="text-slate-500 text-[10px] font-black uppercase mb-2 block">Hero Dynamic Subtitle</span><textarea value={editContent.home.heroSubtitle || ''} onChange={e => updateNested('home', 'heroSubtitle', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 h-20"/></label>
                            <label className="block"><span className="text-slate-500 text-[10px] font-black uppercase mb-2 block">Intro Description Text</span><textarea value={editContent.home.introText || ''} onChange={e => updateNested('home', 'introText', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 h-24"/></label>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
                            <h3 className="flex items-center gap-2 text-red-800 font-bold mb-4 uppercase text-xs tracking-widest"><AlertCircle size={16}/> Maintenance / Outage</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <input type="checkbox" checked={!!editContent.home.maintenance?.enabled} onChange={e => updateNested('home', 'maintenance', { ...editContent.home.maintenance, enabled: e.target.checked })} className="w-5 h-5 accent-red-600"/>
                                <span className="text-sm font-bold text-red-900">Enable Maintenance Warning</span>
                            </div>
                            <input type="text" placeholder="Maintenance Date (e.g. 31/12/2024)" value={editContent.home.maintenance?.date || ''} onChange={e => updateNested('home', 'maintenance', { ...editContent.home.maintenance, date: e.target.value })} className="w-full border border-red-200 rounded-lg p-3 bg-white"/>
                        </div>
                        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6">
                            <h3 className="flex items-center gap-2 text-amber-800 font-bold mb-4 uppercase text-xs tracking-widest"><Video size={16}/> Global Video</h3>
                            <span className="text-xs text-amber-700/60 block mb-2">Full YouTube or Vimeo URL</span>
                            <input type="text" value={editContent.home.internationalVideoUrl || ''} onChange={e => updateNested('home', 'internationalVideoUrl', e.target.value)} className="w-full border border-amber-200 rounded-lg p-3 bg-white mb-2"/>
                            <div className="text-[10px] text-amber-600 italic">Example: https://www.youtube.com/watch?v=LXb3EKWsInQ</div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: ABOUT / TEAM */}
            {activeTab === 'about' && (
                <div className="space-y-8 animate-fade-in-up">
                    {/* Founder Card */}
                    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3"><User /> <h2 className="font-serif font-bold text-xl">Founder Profile</h2></div>
                        </div>
                        <div className="p-8 grid md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <div className="aspect-[3/4] rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                                    {editContent.about.founder.image ? (
                                        <img src={editContent.about.founder.image} className="w-full h-full object-cover rounded-lg" alt="Preview"/>
                                    ) : (
                                        <><ImageIcon className="text-slate-300 mb-2" size={32}/><span className="text-[10px] text-slate-400 font-bold uppercase">No Profile Photo</span></>
                                    )}
                                </div>
                                <input type="text" placeholder="Founder Photo URL" value={editContent.about.founder.image || ''} onChange={e => setEditContent(p => ({...p, about: {...p.about, founder: {...p.about.founder, image: e.target.value}}}))} className="w-full border border-slate-200 rounded-lg p-2 text-xs font-mono"/>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="block"><span className="text-slate-400 text-[10px] font-black uppercase mb-1 block">Full Name</span><input type="text" value={editContent.about.founder.name || ''} onChange={e => setEditContent(p => ({...p, about: {...p.about, founder: {...p.about.founder, name: e.target.value}}}))} className="w-full border border-slate-200 rounded-lg p-3 font-bold"/></label>
                                    <label className="block"><span className="text-slate-400 text-[10px] font-black uppercase mb-1 block">Qualifications</span><input type="text" value={editContent.about.founder.qualifications || ''} onChange={e => setEditContent(p => ({...p, about: {...p.about, founder: {...p.about.founder, qualifications: e.target.value}}}))} className="w-full border border-slate-200 rounded-lg p-3"/></label>
                                </div>
                                <label className="block"><span className="text-slate-400 text-[10px] font-black uppercase mb-1 block">Detailed Founder Bio (Supports Multiple Paragraphs)</span><textarea value={editContent.about.founder.bio || ''} onChange={e => setEditContent(p => ({...p, about: {...p.about, founder: {...p.about.founder, bio: e.target.value}}}))} className="w-full border border-slate-200 rounded-lg p-3 h-48 text-sm leading-relaxed"/></label>
                            </div>
                        </div>
                    </div>

                    {/* Executives List */}
                    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3"><Users className="text-slate-400" /> <h2 className="font-serif font-bold text-xl">Executive Advocates</h2></div>
                            <button onClick={() => addItem('executives')} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all"><Plus size={14}/> Add Advocate</button>
                        </div>
                        <div className="p-8 space-y-6">
                            {editContent.about.executives.map((exec) => (
                                <div key={exec.id} className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50 relative group">
                                    <button onClick={() => removeItem('executives', exec.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <input type="text" placeholder="Name" value={exec.name || ''} onChange={e => updateArrayItem('about.executives', exec.id, 'name', e.target.value)} className="w-full font-bold border-b border-slate-200 bg-transparent py-2 outline-none focus:border-amber-500"/>
                                        <input type="text" placeholder="Role / Title" value={exec.role || ''} onChange={e => updateArrayItem('about.executives', exec.id, 'role', e.target.value)} className="w-full border-b border-slate-200 bg-transparent py-2 outline-none focus:border-amber-500"/>
                                    </div>
                                    <textarea placeholder="Bio description..." value={exec.bio || ''} onChange={e => updateArrayItem('about.executives', exec.id, 'bio', e.target.value)} className="w-full text-xs text-slate-600 bg-transparent h-16 outline-none resize-none"/>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CA List */}
                    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3"><Users className="text-slate-400" /> <h2 className="font-serif font-bold text-xl">Chartered Accountants</h2></div>
                            <button onClick={() => addItem('cas')} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all"><Plus size={14}/> Add Auditor</button>
                        </div>
                        <div className="p-8 grid md:grid-cols-2 gap-6">
                            {editContent.about.cas.map((ca) => (
                                <div key={ca.id} className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50 relative group">
                                    <button onClick={() => removeItem('cas', ca.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                                    <input type="text" placeholder="CA Name" value={ca.name || ''} onChange={e => updateArrayItem('about.cas', ca.id, 'name', e.target.value)} className="w-full font-bold mb-2 border-b border-slate-200 bg-transparent py-2 outline-none"/>
                                    <textarea placeholder="Bio..." value={ca.bio || ''} onChange={e => updateArrayItem('about.cas', ca.id, 'bio', e.target.value)} className="w-full text-xs text-slate-600 bg-transparent h-20 outline-none resize-none"/>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: SERVICES */}
            {activeTab === 'services' && (
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden animate-fade-in-up">
                    <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3"><Briefcase className="text-slate-400" /> <h2 className="font-serif font-bold text-xl">Practice Areas</h2></div>
                        <button onClick={() => addItem('services')} className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-all"><Plus size={14}/> Add Practice Area</button>
                    </div>
                    <div className="p-8 space-y-6">
                        {editContent.services.map((service) => (
                            <div key={service.id} className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50 group relative">
                                <button onClick={() => removeItem('services', service.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                                <div className="grid md:grid-cols-4 gap-6">
                                    <div className="space-y-4">
                                        <label className="block"><span className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Icon Name</span><input type="text" value={service.iconName || ''} onChange={e => updateArrayItem('services', service.id, 'iconName', e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-xs font-mono" placeholder="e.g. Shield"/></label>
                                        <div className="p-3 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-amber-500"><Settings size={24}/></div>
                                    </div>
                                    <div className="md:col-span-3 space-y-4">
                                        <input type="text" placeholder="Service Title" value={service.title || ''} onChange={e => updateArrayItem('services', service.id, 'title', e.target.value)} className="w-full font-bold border-b border-slate-200 bg-transparent py-2 outline-none focus:border-amber-500 text-lg"/>
                                        <textarea placeholder="Detailed description..." value={service.description || ''} onChange={e => updateArrayItem('services', service.id, 'description', e.target.value)} className="w-full text-sm text-slate-600 bg-transparent h-24 outline-none resize-none"/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
                <div className="space-y-10 animate-fade-in-up">
                    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                        <div className="p-6 bg-red-600 text-white flex items-center gap-3"><ShieldCheck /> <h2 className="font-serif font-bold text-xl">Cloud Security Protocol</h2></div>
                        <div className="p-8 grid gap-8">
                            <div className="bg-amber-600 p-8 rounded-2xl text-white shadow-xl">
                                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Key size={20}/> Database Encryption Secret</h3>
                                <p className="text-amber-100 text-xs mb-4">Matches the Firebase Security Rules (Root Key: SomeRandomWord123)</p>
                                <input type="text" value={masterLock || ''} onChange={e => setMasterLock(e.target.value)} className="w-full border-2 border-white/20 bg-white/10 rounded-xl p-4 text-white font-mono outline-none focus:bg-white/20"/>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-6">Staff Access Credentials</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <label className="block"><span className="text-slate-400 text-[10px] font-black uppercase mb-2 block">Username</span><input type="text" value={adminCreds.username || ''} onChange={e => setAdminCreds(prev => ({...prev, username: e.target.value}))} className="w-full border border-slate-200 rounded-xl p-3 bg-white"/></label>
                                    <label className="block">
                                        <span className="text-slate-400 text-[10px] font-black uppercase mb-2 block">Secure Password</span>
                                        <div className="relative">
                                            <input type={showPassword ? "text" : "password"} value={adminCreds.password || ''} onChange={e => setAdminCreds(prev => ({...prev, password: e.target.value}))} className="w-full border border-slate-200 rounded-xl p-3 bg-white pr-12"/>
                                            <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                        </div>
                                    </label>
                                </div>
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