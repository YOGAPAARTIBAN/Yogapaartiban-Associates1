import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { Lock, AlertCircle, KeyRound, Loader2, Wifi, WifiOff } from 'lucide-react';
import { get } from 'firebase/database';
import { INITIAL_ADMIN_CREDENTIALS } from '../constants';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { getDbRef, isFirebaseConnected, content } = useContent();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        // 1. Hardcoded defaults as ultimate fallback
        let validUser = INITIAL_ADMIN_CREDENTIALS.username;
        let validPass = INITIAL_ADMIN_CREDENTIALS.password;

        if (isFirebaseConnected) {
            // 2. Try NEW secure node first
            const adminRef = getDbRef('admin_credentials');
            const secureSnap = await get(adminRef);
            const secureData = secureSnap.val();

            if (secureData && secureData.username) {
                validUser = secureData.username;
                validPass = secureData.password;
            } else {
                // 3. Fallback to OLD content node
                const contentRef = getDbRef('site_content');
                const contentSnap = await get(contentRef);
                const fullData = contentSnap.val();
                
                // Check if credentials exist inside the content object (common in older versions)
                if (fullData && fullData.credentials) {
                    validUser = fullData.credentials.username;
                    validPass = fullData.credentials.password;
                } else if (content && (content as any).credentials) {
                    // Check local state fallback
                    validUser = (content as any).credentials.username;
                    validPass = (content as any).credentials.password;
                }
            }
        }

        if (username === validUser && password === validPass) {
            login();
            navigate('/admin/dashboard');
        } else {
            setError('Invalid credentials. If this is your first time after the update, try default credentials or check your Database.');
        }
    } catch (err: any) {
        setError('Database Error: Check your connection or Firebase Rules.');
        console.error("Login Error:", err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800">
        <div className="flex justify-between items-start mb-6">
           <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isFirebaseConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isFirebaseConnected ? <><Wifi size={10}/> Cloud Active</> : <><WifiOff size={10}/> Offline Mode</>}
           </div>
           <div className="bg-amber-500 p-3 rounded-xl shadow-lg">
            <Lock className="text-white w-6 h-6" />
          </div>
        </div>

        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Firm Management</h2>
        <p className="text-gray-500 mb-8 text-sm">Secure Administrative Access</p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-xs flex items-start gap-3 animate-fade-in-down">
            <AlertCircle size={18} className="shrink-0" /> 
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Username</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              placeholder="Enter password"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all flex justify-center items-center gap-2 shadow-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Sign In to Dashboard'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
           <button onClick={() => navigate('/')} className="text-gray-400 hover:text-slate-900 text-xs transition-colors underline underline-offset-4">Return to Public Website</button>
        </div>
      </div>
    </div>
  );
};

export default Login;