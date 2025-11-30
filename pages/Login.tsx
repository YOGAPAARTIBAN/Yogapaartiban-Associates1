import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { Lock, AlertCircle, Mail, Check } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  
  const { login } = useAuth();
  const { content } = useContent();
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('sending');

    // Create a form data object to send via Formspree
    const formData = new FormData();
    formData.append('subject', 'Admin Credentials Recovery Request');
    formData.append('message', `A request was made to recover the admin credentials for Yogapaartiban Associates Website.\n\nCurrent Username: ${content.credentials?.username}\nCurrent Password: ${content.credentials?.password}\n\nPlease keep these safe.`);
    formData.append('email', 'yogapaartibanassociates@gmail.com'); // Required by some Formspree setups or acts as sender
    
    try {
        const response = await fetch("https://formspree.io/f/xvgyjpqe", {
            method: "POST",
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            setResetStatus('sent');
        } else {
            alert("Failed to send recovery email.");
            setResetStatus('idle');
        }
    } catch (err) {
        alert("Network error. Please try again.");
        setResetStatus('idle');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative">
      {/* Forgot Password Modal */}
      {showForgot && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-white rounded-lg p-8 max-w-sm w-full shadow-2xl">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Lock size={20} className="text-amber-600"/> Recover Credentials
                  </h3>
                  
                  {resetStatus === 'sent' ? (
                      <div className="text-center py-4">
                          <div className="bg-green-100 text-green-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Check size={24} />
                          </div>
                          <p className="text-green-800 font-bold mb-2">Email Sent!</p>
                          <p className="text-sm text-gray-600 mb-4">
                              Your current credentials have been sent to <strong>yogapaartibanassociates@gmail.com</strong>.
                          </p>
                          <button 
                            onClick={() => { setShowForgot(false); setResetStatus('idle'); }}
                            className="text-sm underline text-slate-500 hover:text-slate-800"
                          >
                              Close
                          </button>
                      </div>
                  ) : (
                      <>
                        <p className="text-sm text-gray-600 mb-6">
                            For security, we can email your current username and password to the registered owner's email address: <br/>
                            <strong>yogapaartibanassociates@gmail.com</strong>
                        </p>
                        <form onSubmit={handleForgotPassword}>
                            <button 
                                type="submit" 
                                disabled={resetStatus === 'sending'}
                                className="w-full bg-amber-600 text-white font-bold py-2 rounded hover:bg-amber-700 transition-colors mb-3"
                            >
                                {resetStatus === 'sending' ? 'Sending...' : 'Send Recovery Email'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setShowForgot(false)}
                                className="w-full text-slate-500 text-sm hover:text-slate-800"
                            >
                                Cancel
                            </button>
                        </form>
                      </>
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
           <button onClick={() => setShowForgot(true)} className="text-amber-600 font-medium hover:text-amber-700">
             Forgot Password?
           </button>
        </div>
      </div>
    </div>
  );
};

export default Login;