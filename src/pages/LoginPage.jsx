import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const LoginPage = () => {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [message, setMessage] = useState('');

  const { login, register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setMessage('');

    try {
      if (tab === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else {
        const result = await register(email, password, fullName, role);
        if (result?.needsConfirmation) {
          setMessage('注册成功！请检查邮箱确认链接。');
          setTab('login');
        } else {
          navigate('/dashboard');
        }
      }
    } catch {
      // Error is already set in the store
    }
  };

  const switchTab = (newTab) => {
    setTab(newTab);
    clearError();
    setMessage('');
  };

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
          <Cpu className="text-white" size={24} />
        </div>
        <span className="text-2xl font-black tracking-tighter text-slate-800">
          EconLogic <span className="text-blue-600 uppercase text-sm">AI</span>
        </span>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
        <button
          onClick={() => switchTab('login')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
            tab === 'login'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          登录
        </button>
        <button
          onClick={() => switchTab('register')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
            tab === 'register'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          注册
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-5">
        {tab === 'register' && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                姓名
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/20 transition-all"
                placeholder="请输入姓名"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                角色
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"
              >
                <option value="student">学生</option>
                <option value="teacher">老师</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            邮箱
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/20 transition-all"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/20 transition-all"
            placeholder="至少 6 位"
            required
            minLength={6}
          />
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl border border-red-100">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 text-green-600 text-sm font-medium px-4 py-3 rounded-xl border border-green-100">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              处理中...
            </>
          ) : tab === 'login' ? (
            '登录'
          ) : (
            '创建账户'
          )}
        </button>
      </form>
    </main>
  );
};

export default LoginPage;
