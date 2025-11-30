import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { Lock, AlertCircle, Check, KeyRound, Shield } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  
  // Password Reset States
  const [resetStep, setResetStep] = useState<'email' | 'verify' | 'new_password'>('email');
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [inputCode, setInputCode] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const { login } = useAuth();
  const { content, updateContent } = useContent();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check against database credentials instead of hardcoded strings
    const validUser = content.credentials?.username || 'ya_team';
    const validPass = content.credentials?.password || 'team_ay';

    if (username === validUser && password === validPass) {
      login();
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleSendRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('sending');

    // Generate a random 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. Save code to database first
    updateContent({
      credentials: {
        ...content.credentials,
        recoveryCode: code
      }
    });

    // 2. Send code via Formspree
    const formData = new FormData();
    formData.append('subject', 'Admin Password Reset Code');
    formData.append('message', `A request was made to reset the admin password for Yogapaartiban Associates Website.\n\nYOUR RECOVERY CODE: ${code}\n\nUse this code on the website to set a new password.\nIf you did not request this, please ignore this email.`);
    formData.append('email', 'yogapaartibanassociates@gmail.com'); 
    
    try {
        const response = await fetch("https://formspree.io/f/xvgyjpqe", {
            method: "POST",
            body: formData,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            setResetStatus('sent');
            setResetStep('verify'); // Move to verification step
        } else {
            alert("Failed to send recovery email. Please check your network.");
            setResetStatus('idle');
        }
    } catch (err) {
        alert("Network error. Please try again.");
        setResetStatus('idle');
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const storedCode = content.credentials?.recoveryCode;
    
    if (storedCode && inputCode === storedCode) {
        setResetStep('new_password');
    } else {
        alert("Invalid Code. Please check the email and try again.");
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
        alert("Please fill in all fields");
        return;
    }

    // Update credentials and clear recovery code
    updateContent({
        credentials: {
            username: newUsername,
            password: newPassword,
            recoveryCode: null
        }
    });

    alert("Password successfully reset! Please login with your new credentials.");
    setShowForgot(false);
    setResetStep('email');
    setResetStatus('idle');
  };

  const closeForgot = () => {
      setShowForgot(false);
      setResetStep('email');
      setResetStatus('idle');
      setInputCode('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative">
      {/* Forgot Password Modal */}
      {showForgot && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-white rounded-lg p-8 max-w-sm w-full shadow-2xl relative">
                  <button onClick={closeForgot} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold">✕</button>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Shield size={20} className="text-amber-600"/> 
                      {resetStep === 'email' && 'Reset Password'}
                      {resetStep === 'verify' && 'Enter Code'}
                      {resetStep === 'new_password' && 'Set New Credentials'}
                  </h3>
                  
                  {/* STEP 1: SEND EMAIL */}
                  {resetStep === 'email' && (
                      <form onSubmit={handleSendRecoveryCode}>
                          <p className="text-sm text-gray-600 mb-6">
                            We will send a 6-digit verification code to the registered owner's email address: <br/>
                            <strong>yogapaartibanassociates@gmail.com</strong>
                          </p>
                          <button 
                              type="submit" 
                              disabled={resetStatus === 'sending'}
                              className="w-full bg-amber-600 text-white font-bold py-2 rounded hover:bg-amber-700 transition-colors mb-3 flex justify-center items-center gap-2"
                          >
                              {resetStatus === 'sending' ? 'Sending Code...' : 'Send Verification Code'}
                          </button>
                      </form>
                  )}

                  {/* STEP 2: VERIFY CODE */}
                  {resetStep === 'verify' && (
                      <form onSubmit={handleVerifyCode}>
                          <p className="text-sm text-gray-600 mb-4">
                            Please enter the 6-digit code sent to your email.
                          </p>
                          <input 
                              type="text" 
                              className="w-full p-3 border border-gray-300 rounded text-center text-2xl tracking-widest font-mono mb-4"
                              placeholder="000000"
                              maxLength={6}
                              value={inputCode}
                              onChange={(e) => setInputCode(e.target.value)}
                          />
                          <button 
                              type="submit" 
                              className="w-full bg-amber-600 text-white font-bold py-2 rounded hover:bg-amber-700 transition-colors mb-3"
                          >
                              Verify Code
                          </button>
                          <button type="button" onClick={() => setResetStep('email')} className="w-full text-xs text-blue-600 hover:underline">
                              Resend Code
                          </button>
                      </form>
                  )}

                  {/* STEP 3: NEW PASSWORD */}
                  {resetStep === 'new_password' && (
                      <form onSubmit={handleResetPassword} className="space-y-4">
                           <div className="bg-green-50 text-green-700 p-3 rounded text-sm flex items-center gap-2">
                               <Check size={16} /> Code Verified. Set new details.
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Username</label>
                               <input 
                                   type="text" 
                                   className="w-full p-2 border border-gray-300 rounded"
                                   required
                                   value={newUsername}
                                   onChange={e => setNewUsername(e.target.value)}
                               />
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                               <input 
                                   type="password" 
                                   className="w-full p-2 border border-gray-300 rounded"
                                   required
                                   value={newPassword}
                                   onChange={e => setNewPassword(e.target.value)}
                               />
                           </div>
                           <button 
                              type="submit" 
                              className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition-colors mt-2"
                          >
                              Update Credentials
                          </button>
                      </form>
                  )}
              </div>
          </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-500 p-4 rounded-full">
            <Lock className="text-white w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-serif font-bold text-center text-slate-900 mb-2">Official Login</h2>
        <p className="text-center text-gray-500 mb-8">Yogapaartiban Associates Admin Panel</p>
        
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
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              placeholder="Enter password"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white font-bold py-3 rounded hover:bg-slate-800 transition-colors"
          >
            Access Dashboard
          </button>
        </form>
        
        <div className="mt-6 flex justify-between items-center text-sm">
           <button onClick={() => navigate('/')} className="text-gray-500 hover:text-amber-600 underline">
            Back to Website
           </button>
           <button onClick={() => { setShowForgot(true); setResetStep('email'); }} className="text-amber-600 font-medium hover:text-amber-700 flex items-center gap-1">
             <KeyRound size={14}/> Forgot Password?
           </button>
        </div>
      </div>
    </div>
  );
};

export default Login;