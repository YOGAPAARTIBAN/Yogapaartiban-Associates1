import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'ya_team' && password === 'team_ay') {
      login();
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-500 p-4 rounded-full">
            <Lock className="text-white w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-serif font-bold text-center text-slate-900 mb-2">Official Login</h2>
        <p className="text-center text-gray-500 mb-8">Yogapaartiban Associates Admin Panel</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm text-center">
            {error}
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
        
        <div className="mt-6 text-center">
          <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-amber-600 underline">
            Back to Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;