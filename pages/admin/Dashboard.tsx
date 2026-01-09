import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, User, ImageIcon, Database, Cloud, Lock, ShieldCheck, Eye, EyeOff, MapPin, BellRing, Loader2 } from 'lucide-react';
import { set, get } from 'firebase/database';
import { INITIAL_ADMIN_CREDENTIALS } from '../../constants';

const Dashboard: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { content, updateContent, resetContent, isFirebaseConnected, connectionSource, connectToDatabase, getDbRef } = useContent();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'home' | 'about' | 'services' | 'database' | 'security'>('general');
  const [showPassword, setShowPassword] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [adminCreds, setAdminCreds] = useState(INITIAL_ADMIN_CREDENTIALS);

  useEffect(() => {
    if (isFirebaseConnected) {
        const adminRef = getDbRef('admin_credentials');
        if (adminRef) {
            get(adminRef).then(snap => {
                if (snap.exists()) setAdminCreds(snap.val());
            });
        }
    }
  }, [isFirebaseConnected]);

  if (!isAuthenticated) { navigate('/official-login'); return null; }

  const handleSave = async () => {
    updateContent(editContent);
    
    // Save credentials to separate node
    if (isFirebaseConnected && activeTab === 'security') {
        const adminRef = getDbRef('admin_credentials');
        if (adminRef) {
            await set(adminRef, adminCreds);
        }
    }
    alert('Changes saved successfully!');
  };

  const updateNested = (section: keyof typeof content, key: string, value: string) => {
    setEditContent(prev => ({ ...prev, [section]: { ...(prev[section] as any), [key]: value } }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <h1 className="font-bold text-xl flex items-center gap-2">CMS Admin</h1>
        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded flex items-center gap-2 font-medium"><Save size={18} /> Save</button>
          <button onClick={() => { logout(); navigate('/official-login'); }} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2 font-medium"><LogOut size={18} /> Logout</button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="bg-white rounded shadow min-h-[600px] flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-64 bg-slate-50 border-r border-gray-200 p-4 flex flex-col gap-2">
            {(['general', 'contact', 'home', 'about', 'services', 'database', 'security'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`text-left px-4 py-3 rounded font-medium capitalize ${activeTab === tab ? 'bg-slate-200 text-slate-900' : 'text-gray-600 hover:bg-slate-100'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-150px)]">
            {activeTab === 'general' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-2xl font-bold border-b pb-2">General</h2>
                <label className="block">
                    <span className="text-gray-700 text-sm font-bold">Tagline</span>
                    <input type="text" value={editContent.general.tagline} onChange={e => updateNested('general', 'tagline', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded p-2"/>
                </label>
              </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-6 max-w-xl">
                    <h2 className="text-2xl font-bold border-b pb-2">Security</h2>
                    <div className="bg-red-50 p-6 rounded border border-red-200">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="text-red-600 w-8 h-8" />
                            <h3 className="text-lg font-bold">Admin Credentials</h3>
                        </div>
                        <div className="grid gap-6">
                            <label className="block">
                                <span className="text-gray-700 text-sm font-bold">Username</span>
                                <input type="text" value={adminCreds.username} onChange={e => setAdminCreds(prev => ({...prev, username: e.target.value}))} className="mt-1 block w-full border border-gray-300 rounded p-3"/>
                            </label>
                            <label className="block relative">
                                <span className="text-gray-700 text-sm font-bold">Password</span>
                                <div className="relative mt-1">
                                    <input type={showPassword ? "text" : "password"} value={adminCreds.password} onChange={e => setAdminCreds(prev => ({...prev, password: e.target.value}))} className="block w-full border border-gray-300 rounded p-3 pr-10"/>
                                    <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </label>
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