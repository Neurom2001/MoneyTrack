import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/storageService';

interface AuthProps {
  onLogin: (username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!username || !password) {
      setError('အသုံးပြုသူအမည်နှင့် စကားဝှက်ကို ဖြည့်သွင်းပါ။');
      setIsLoading(false);
      return;
    }

    try {
      if (isLoginView) {
        const result = await loginUser(username, password);
        if (result.success) {
          onLogin(username);
        } else {
          setError('အကောင့်ဝင်မရပါ (သို့) စကားဝှက်မှားယွင်းနေပါသည်။');
        }
      } else {
        const result = await registerUser(username, password);
        if (result.success) {
          setSuccess('အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။ ကျေးဇူးပြု၍ ဝင်ရောက်ပါ။');
          setIsLoginView(true);
          setPassword('');
        } else {
          setError(result.error || 'အကောင့်ဖွင့်မရပါ။ ထပ်မံကြိုးစားကြည့်ပါ။');
        }
      }
    } catch (err) {
      setError('System Error: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="bg-dark-card p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-primary">
        <h2 className="text-2xl font-bold text-center text-dark-text mb-6">
          {isLoginView ? 'အကောင့်ဝင်ရန်' : 'အကောင့်သစ်ဖွင့်ရန်'}
        </h2>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded relative mb-4 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/30 border border-green-800 text-green-200 px-4 py-3 rounded relative mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-dark-muted text-sm font-bold mb-2">
              အသုံးပြုသူအမည် (User Name)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="ဥပမာ - mgmg"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-dark-muted text-sm font-bold mb-2">
              စကားဝှက် (Password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="******"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-primary hover:bg-emerald-600 text-slate-900 font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'လုပ်ဆောင်နေသည်...' : (isLoginView ? 'ဝင်ရောက်မည်' : 'စာရင်းသွင်းမည်')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError('');
              setSuccess('');
            }}
            disabled={isLoading}
            className="text-sm text-primary hover:text-emerald-400 underline"
          >
            {isLoginView 
              ? 'အကောင့်မရှိဘူးလား? အကောင့်သစ်ဖွင့်ပါ' 
              : 'အကောင့်ရှိပြီးသားလား? ဝင်ရောက်ပါ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;