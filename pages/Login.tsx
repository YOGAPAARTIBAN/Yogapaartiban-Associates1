import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { Lock, AlertCircle, KeyRound, Loader2 } from 'lucide-react';
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
        // 1. Start with hardcoded defaults
        let validUser = INITIAL_ADMIN_CREDENTIALS.username;
        let validPass = INITIAL_ADMIN_CREDENTIALS.password;

        if (isFirebaseConnected) {
            // 2. Try to get from the NEW secure location
            const adminRef = getDbRef('admin_credentials');
            if (adminRef) {
                const snapshot = await get(adminRef);
                const cloudCreds = snapshot.val();
                
                if (cloudCreds && cloudCreds.username) {
                    validUser = cloudCreds.username;
                    validPass = cloudCreds.password;
                    console.log("Using secure cloud credentials");
                } else {
                    // 3. Fallback: If new location is empty, check if it's still in the old content object
                    // This prevents lockout during migration
                    const legacyCreds = (content as any).credentials;
                    if (legacyCreds && legacyCreds.username) {
                        validUser = legacyCreds.username;
                        validPass = legacyCreds.password;
                        console.log("Using legacy cloud credentials");
                    }
                }
            }
        }

        if (username === validUser && password === validPass) {
            login();
            navigate('/admin/dashboard');
        } else {
            setError('Invalid credentials. If you just updated the app, try the default username/password.');
        }
    } catch (err: any) {
        setError('Connection error. Please check your internet or Firebase rules.');
        console.error("Login fetch error:", err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-500 p-4 rounded-full shadow-inner">
            <Lock className="text-white w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-serif font-bold text-center text-slate-900 mb-2">Management Login</h2>
        <p className="text-center text-gray-500 mb-8 text-sm">Authorized Personnel Only</p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 text-xs flex items-start gap-2 animate-fade-in-down">
            <AlertCircle size={18} className="shrink-0" /> 
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Username</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="Enter password"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-lg hover:bg-slate-800 transition-all flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Access Dashboard'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center text-xs">
           <button onClick={() => navigate('/')} className="text-gray-400 hover:text-slate-900 transition-colors">← Back to Website</button>
           <div className="flex items-center gap-1 text-gray-400">
             <KeyRound size={12}/> Secure Access
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;