import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  role: 'student' | 'teacher' | 'parent' | 'admin';
  onSubmit: (email: string) => Promise<void>;
}

export default function LoginForm({ role, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(email);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRolePlaceholder = () => {
    if (role === 'student') return "student@school.edu";
    if (role === 'teacher') return "teacher@school.edu";
    if (role === 'parent') return "parent@family.com";
    return "admin@jigyasa.gov.in";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
           <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
           {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-purple-500 transition-colors bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400"
            placeholder={getRolePlaceholder()}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-purple-500 transition-colors bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400"
            placeholder="••••••••"
          />
        </div>
        <div className="flex justify-end mt-2">
          <a href="#" className="text-xs font-semibold text-purple-600 hover:text-purple-500 transition-colors">
            Forgot password?
          </a>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 cursor-pointer`}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" />
            Authenticating...
          </>
        ) : (
          <>
            Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
