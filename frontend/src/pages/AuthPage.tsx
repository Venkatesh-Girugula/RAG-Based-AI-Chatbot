import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import { useStore } from '../store/useStore';

export const AuthPage: React.FC = () => {
  const { authScreen, setAuthScreen, login, rememberMe, setRememberMe } = useStore();
  
  // Local form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Validation / Loading states
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setValidationError('Please populate both email and password fields.');
      return;
    }
    if (!email.includes('@')) {
      setValidationError('Invalid email signature detected.');
      return;
    }
    if (password.length < 6) {
      setValidationError('Credentials must be at least 6 characters in length.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login(email, 'Venkat Raman');
    }, 1200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setValidationError('Please populate all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Entered passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setValidationError('Please accept the User Master Service Terms and Privacy Agreement.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthScreen('verify');
    }, 1200);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email.includes('@')) {
      setValidationError('Please enter a valid business email domain address.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthScreen('verify');
    }, 1000);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (otpCode.length < 4) {
      setValidationError('Please input the full 4-digit security PIN.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthScreen('success');
    }, 1200);
  };

  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      
      {/* Premium Neon Ambient Orbs */}
      <div className="glow-bg bg-brand-500/10 w-[550px] h-[550px] -top-60 -left-40 animate-pulse" />
      <div className="glow-bg bg-indigo-500/5 w-[650px] h-[650px] -bottom-60 -right-40" />

      {/* Main Glassmorphic Wrapper */}
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel shadow-glass border border-slate-900/60 z-10 m-4 relative">
        
        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20 mb-3 animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            AeroRAG Enterprise
          </h2>
          <p className="text-xs text-slate-500 font-medium">Grounded RAG Intelligence Network</p>
        </div>

        {/* Validation Notification Banner */}
        {validationError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/20 flex items-start gap-3 text-red-200 text-xs"
          >
            <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
            <span className="font-medium">{validationError}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {authScreen === 'login' && (
            <motion.div key="login" {...pageTransition}>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input 
                      type="email" 
                      placeholder="name@company.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full py-3.5 pl-11 pr-4 rounded-xl glass-input text-sm text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setAuthScreen('forgot')}
                      className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-3.5 pl-11 pr-11 rounded-xl glass-input text-sm text-slate-200"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-brand-500 focus:ring-brand-500/20"
                    />
                    <span>Remember this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm font-semibold text-white shadow-md shadow-brand-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Decrypting Security Keys...' : 'Authenticate'}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="text-center pt-4 text-xs text-slate-500">
                  <span>Don't have a secure identity? </span>
                  <button 
                    type="button"
                    onClick={() => setAuthScreen('register')}
                    className="text-brand-400 hover:text-brand-300 font-semibold"
                  >
                    Request Access
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {authScreen === 'register' && (
            <motion.div key="register" {...pageTransition}>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Venkat Raman"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full py-3.5 pl-11 pr-4 rounded-xl glass-input text-sm text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Corporate Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input 
                      type="email" 
                      placeholder="venky@enterprise.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full py-3.5 pl-11 pr-4 rounded-xl glass-input text-sm text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Security Key Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-3.5 pl-11 pr-4 rounded-xl glass-input text-sm text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full py-3.5 pl-11 pr-4 rounded-xl glass-input text-sm text-slate-200"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-brand-500 focus:ring-brand-500/20 mt-0.5"
                    />
                    <span className="leading-tight">I accept the secure cloud service guidelines and GDPR classification standards.</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm font-semibold text-white shadow-md shadow-brand-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Creating Identity Key...' : 'Request Credentials'}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="text-center pt-4 text-xs text-slate-500">
                  <span>Already hold corporate access? </span>
                  <button 
                    type="button"
                    onClick={() => setAuthScreen('login')}
                    className="text-brand-400 hover:text-brand-300 font-semibold"
                  >
                    Authenticate
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {authScreen === 'forgot' && (
            <motion.div key="forgot" {...pageTransition}>
              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Enter your registered enterprise business email address. We will verify credentials and dispatch a 4-digit security PIN to recover access.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Verification Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input 
                      type="email" 
                      placeholder="name@company.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full py-3.5 pl-11 pr-4 rounded-xl glass-input text-sm text-slate-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm font-semibold text-white shadow-md shadow-brand-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Checking Security Records...' : 'Send Recovery PIN'}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => setAuthScreen('login')}
                    className="text-xs text-slate-400 hover:text-slate-200 font-medium"
                  >
                    Return to Login
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {authScreen === 'verify' && (
            <motion.div key="verify" {...pageTransition}>
              <form onSubmit={handleOtpVerify} className="space-y-4 text-center">
                <Fingerprint className="h-12 w-12 text-brand-400 mx-auto mb-2 animate-bounce" />
                <h3 className="text-sm font-bold text-slate-200">OTP Security Check</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We have dispatched a 4-digit verification security PIN to your corporate address. Please enter the security PIN below:
                </p>

                <div className="flex justify-center pt-2">
                  <input 
                    type="text" 
                    maxLength={4}
                    placeholder="0000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-32 py-3 text-center tracking-[0.7em] text-lg font-bold rounded-xl glass-input text-brand-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm font-semibold text-white shadow-md shadow-brand-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Verifying Credentials...' : 'Verify Pin'}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="text-xs text-slate-500">
                  <span>Haven't received the PIN? </span>
                  <button 
                    type="button"
                    onClick={() => setValidationError('A new security PIN has been dispatched to your email address.')}
                    className="text-brand-400 hover:text-brand-300 font-semibold"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {authScreen === 'success' && (
            <motion.div key="success" {...pageTransition} className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto animate-pulse" />
              <h3 className="text-md font-bold text-slate-100">Identity Securely Verified</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Your authorization context has been successfully resolved. Launching secure workspace console...
              </p>

              <button
                onClick={() => login('admin@enterprise.io', 'Venkat Raman')}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-md shadow-emerald-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Access Footer */}
        <div className="mt-8 pt-6 border-t border-slate-900/60 flex justify-between items-center text-[10px] text-slate-600">
          <span>Encrypted with TLS 1.3</span>
          <span>AeroRAG Corporate Inc.</span>
        </div>
      </div>
    </div>
  );
};
export default AuthPage;
