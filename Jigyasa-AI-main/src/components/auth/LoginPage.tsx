import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Compass, BookOpen, ShieldAlert, Heart } from 'lucide-react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  const [role, setRole] = useState<'student' | 'teacher' | 'parent' | 'admin'>('student');
  const navigate = useNavigate();

  const handleLogin = async (email: string) => {
    // Mock authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple routing based on selected role
    if (role === 'student') {
      navigate('/student');
    } else if (role === 'teacher') {
      navigate('/teacher');
    } else if (role === 'parent') {
      navigate('/parent');
    } else if (role === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-150 selection:text-indigo-900 font-sans">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="bg-slate-950 text-white w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-900 shadow-sm relative overflow-hidden mb-4">
          <span className="font-display font-black text-3xl text-purple-400">J</span>
        </div>
        <h2 className="mt-2 text-center text-3xl font-display font-bold tracking-tight text-slate-900">
          Jigyasa AI
        </h2>
        <p className="mt-2 text-center text-sm text-slate-650 max-w-sm">
          Welcome to India's Socratic Curiosity Core. Log in to continue your learning journey.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          
          {/* Role Select Grid */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setRole('student')}
              className={`flex justify-center items-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                role === 'student'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Student
            </button>
            <button
              onClick={() => setRole('teacher')}
              className={`flex justify-center items-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                role === 'teacher'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Teacher
            </button>
            <button
              onClick={() => setRole('parent')}
              className={`flex justify-center items-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                role === 'parent'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Parent
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`flex justify-center items-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                role === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          {/* Form Context Info */}
          <div className="mb-6 border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {role === 'student' && 'Student Login'}
              {role === 'teacher' && 'Teacher Login'}
              {role === 'parent' && 'Parent Login'}
              {role === 'admin' && 'Admin Console Login'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {role === 'student' && 'Access Socratic inquiry paths, complete baseline tests, and view passports.'}
              {role === 'teacher' && 'Access student rosters, set syllabus goals, and review rubrics.'}
              {role === 'parent' && 'Monitor student growth charts, competency progress, and recommended tips.'}
              {role === 'admin' && 'Manage regional curriculum standards, upload syllabus items, and configure topics.'}
            </p>
          </div>

          {/* Login Form */}
          <LoginForm role={role} onSubmit={handleLogin} />

        </div>

        {/* Footer features */}
        <div className="mt-8 flex justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <BookOpen className="w-4 h-4 text-emerald-500" /> Active Learning
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <GraduationCap className="w-4 h-4 text-purple-500" /> Socratic Method
          </div>
        </div>
      </div>
    </div>
  );
}
