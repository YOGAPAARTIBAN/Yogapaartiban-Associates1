import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { Lock, AlertCircle, Check, KeyRound, Shield, Loader2 } from 'lucide-react';
import { get } from 'firebase/database';
import { INITIAL_ADMIN_CREDENTIALS } from '../constants';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  
  const [resetStep, setResetStep] = useState<'email' | 'verify' | 'new_password'>('email');
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [inputCode, setInputCode] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const { login } = useAuth();
  const { getDbRef, isFirebaseConnected } = useContent();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        let validUser = INITIAL_ADMIN_CREDENTIALS.username;
        let validPass = INITIAL_ADMIN_CREDENTIALS.password;

        if (isFirebaseConnected) {
            const adminRef = getDbRef('admin_credentials');
            if (adminRef) {
                const snapshot = await get(adminRef);
                const cloudCreds = snapshot.val();
                if (cloudCreds) {
                    validUser = cloudCreds.username || validUser;
                    validPass = cloudCreds.password || validPass;
                }
            }
        }

        if (username === validUser && password === validPass) {
            login();
            navigate('/admin/dashboard');
        } else {
            setError('Invalid credentials');
        }
    } catch (err: any) {
        setError('Login failed. Please check your connection.');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleSendRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('sending');
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Logic for sending email via Formspree...
    const formData = new FormData();
    formData.append('subject', 'Admin Password Reset Code');
    formData.append('message', `YOUR RECOVERY CODE: ${code}`);
    formData.append('email', 'yogapaartibanassociates@gmail.com'); 
    
    try {
        const response = await fetch("https://formspree.io/f/xvgyjpqe", {
            method: "POST",
            body: formData,
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            setResetStatus('sent');
            setResetStep('verify');
        } else {
            alert("Failed to send email.");
            setResetStatus('idle');
        }
    } catch (err) {
        setResetStatus('idle');
    }
  };

  // Rest of the reset functions...
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-500 p-4 rounded-full">
            <Lock className="text-white w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-serif font-bold text-center text-slate-900 mb-2">Official Login</h2>
        <p className="text-center text-gray-500 mb-8">Admin Panel</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm text-center flex items-center justify-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Password"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Access Dashboard'}
          </button>
        </form>
        
        <div className="mt-6 flex justify-between items-center text-sm">
           <button onClick={() => navigate('/')} className="text-gray-500 hover:text-amber-600 underline">Back to Website</button>
           <button onClick={() => { setShowForgot(true); }} className="text-amber-600 font-medium hover:text-amber-700 flex items-center gap-1">
             <KeyRound size={14}/> Forgot?
           </button>
        </div>
      </div>
    </div>
  );
};

export default Login;