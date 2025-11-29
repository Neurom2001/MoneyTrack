
import React, { useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/storageService';
import { Wallet, AlertTriangle, Eye, EyeOff, ShieldCheck, PieChart, TrendingUp, Heart, Copyright, Mail, Send, CheckCircle2, AlertCircle, User, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { TRANSLATIONS, Language } from '../utils/translations';

interface AuthProps {
  onLogin: (username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use default language or from local storage
  const [language] = useState<Language>((localStorage.getItem('language') as Language) || 'my');
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const t = TRANSLATIONS[language];

  const features = [
    { icon: <TrendingUp size={20} />, title: t.feat1, desc: "Track every kyat" },
    { icon: <PieChart size={20} />, title: t.feat2, desc: "Visualize habits" },
    { icon: <ShieldCheck size={20} />, title: t.feat4, desc: "Secure & Private" },
  ];

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000); 
  };

  useEffect(() => {
    if (isLoginView) {
      const regSuccess = localStorage.getItem('registrationSuccess');
      if (regSuccess === 'true') {
        showToast(language === 'my' 
            ? 'အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။ ကျေးဇူးပြု၍ စကားဝှက်ဖြင့် ပြန်လည်ဝင်ရောက်ပါ။'
            : 'Registration successful. Please login.', 
            'success');
        localStorage.removeItem('registrationSuccess');
      }
    }
  }, [isLoginView, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError(language === 'my' ? 'အသုံးပြုသူအမည်နှင့် စကားဝှက်ကို ဖြည့်သွင်းပါ။' : 'Please fill in username and password.');
      setIsLoading(false);
      return;
    }

    if (!isLoginView && password.length < 6) {
        setError(language === 'my' ? 'စကားဝှက်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်။' : 'Password must be at least 6 characters.');
        setIsLoading(false);
        return;
    }

    try {
      if (isLoginView) {
        localStorage.setItem('loginSuccess', 'true');
        const result = await loginUser(username, password);
        if (result.success) {
           // Success handling handled by App.tsx via supabase subscription
        } else {
          localStorage.removeItem('loginSuccess');
          setError(language === 'my' ? 'အကောင့်ဝင်မရပါ (သို့) စကားဝှက်မှားယွင်းနေပါသည်။' : 'Login failed or invalid credentials.');
          setIsLoading(false);
        }
      } else {
        const result = await registerUser(username, password);
        if (result.success) {
          setPassword('');
          localStorage.setItem('registrationSuccess', 'true');
          setIsLoginView(true);
          setIsLoading(false);
        } else {
          setError(result.error || (language === 'my' ? 'အကောင့်ဖွင့်မရပါ။ ထပ်မံကြိုးစားကြည့်ပါ။' : 'Registration failed. Please try again.'));
          setIsLoading(false);
        }
      }
    } catch (err) {
      localStorage.removeItem('loginSuccess');
      setError('System Error: ' + err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col lg:flex-row relative overflow-x-hidden selection:bg-primary/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[80px] animate-pulse delay-1000"></div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 w-11/12 max-w-sm">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-900/80 border-emerald-500/50 text-emerald-100' : 'bg-red-900/80 border-red-500/50 text-red-100'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={24} className="shrink-0 text-emerald-400" /> : <AlertCircle size={24} className="shrink-0 text-red-400" />}
            <span className="text-sm font-medium">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Left Panel: Branding & Visuals (Desktop) / Bottom (Mobile) */}
      <div className="w-full lg:w-[55%] order-2 lg:order-1 relative flex flex-col justify-between p-8 lg:p-16 z-10">
        
        {/* Desktop Branding Content */}
        <div className="hidden lg:flex flex-col h-full justify-center max-w-lg mx-auto lg:mx-0">
            <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 w-fit backdrop-blur-md">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">Smart Finance Tracker</span>
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
                Master your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Money Flow</span>
            </h1>

            <p className="text-slate-400 text-lg mb-12 leading-relaxed">
                {language === 'my' 
                 ? "သင့်ငွေကြေးစီမံခန့်ခွဲမှုအတွက် အကောင်းဆုံးလက်ထောက်။ မြန်မာဘာသာဖြင့် အသုံးပြုရလွယ်ကူပြီး တိကျသေချာသော စာရင်းအင်းစနစ်။"
                 : "The easiest way to track your income and expenses. Join thousands of users who are taking control of their financial future."}
            </p>

            <div className="space-y-4">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/60 transition group cursor-default backdrop-blur-sm">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition duration-300">
                            <div className="text-emerald-400 group-hover:scale-110 transition">{feature.icon}</div>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-200">{feature.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Footer Links (Visible on Mobile & Desktop) */}
        <div className="mt-12 lg:mt-0 flex flex-col items-center lg:items-start gap-4 text-sm text-slate-500">
             <div className="flex flex-wrap justify-center gap-6">
                 <a href="mailto:bornaskraz@gmail.com" className="flex items-center gap-2 hover:text-emerald-400 transition group">
                    <Mail size={16} className="group-hover:scale-110 transition"/> Support
                 </a>
                 <a href="https://t.me/swelmyel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400 transition group">
                    <Send size={16} className="group-hover:scale-110 transition"/> Telegram
                 </a>
             </div>
             <div className="flex items-center gap-1 text-xs opacity-60">
                 <span>&copy; {new Date().getFullYear()} {t.appName}.</span>
                 <span className="hidden sm:inline">Made with <Heart size={10} className="inline text-red-500 fill-red-500 mx-0.5"/> by @swelmyel</span>
             </div>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="w-full lg:w-[45%] order-1 lg:order-2 flex flex-col justify-center items-center p-6 lg:p-12 relative z-20">
        
        {/* Mobile Logo Header */}
        <div className="lg:hidden w-full flex flex-col items-center mb-8 mt-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 transform rotate-3">
                <Wallet className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t.appName}</h2>
            <p className="text-emerald-500 text-xs font-bold tracking-widest uppercase mt-1">{t.appDesc}</p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Top Light Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
            
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                    {isLoginView ? t.loginTitle : t.registerTitle}
                </h2>
                <p className="text-slate-400">
                    {isLoginView ? t.loginSubtitle : t.registerSubtitle}
                </p>
            </div>

            {/* Warning Box */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 mb-6">
                <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                <p className="text-xs text-amber-200/80 leading-relaxed">
                    {t.warningText}
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-2xl text-sm flex items-center gap-3 animate-in shake mb-6">
                    <AlertCircle size={18} className="shrink-0" /> {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">
                        {t.username}
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User size={18} className="text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300"/>
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-slate-950/50 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 placeholder-slate-600 hover:border-slate-700"
                            placeholder={t.usernamePlaceholder}
                            disabled={isLoading}
                            autoComplete="username"
                        />
                    </div>
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">
                        {t.password}
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock size={18} className="text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300"/>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-11 pr-12 py-4 bg-slate-950/50 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 placeholder-slate-600 hover:border-slate-700"
                            placeholder={t.passwordPlaceholder}
                            disabled={isLoading}
                            autoComplete={isLoginView ? "current-password" : "new-password"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition p-2 rounded-lg hover:bg-white/5"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed grayscale' : ''}`}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            {isLoginView ? t.loginBtn : t.registerBtn}
                            <ArrowRight size={18} className="opacity-80" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                <p className="text-slate-400 text-sm mb-3">
                    {isLoginView ? t.noAccount : t.hasAccount}
                </p>
                <button
                    onClick={() => {
                        setIsLoginView(!isLoginView);
                        setError('');
                        setToast(null);
                    }}
                    disabled={isLoading}
                    className="text-emerald-400 hover:text-emerald-300 font-bold transition-all text-sm py-2 px-4 rounded-lg hover:bg-emerald-400/10"
                >
                    {isLoginView ? t.createAccount : t.signIn}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
