import { Cpu, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Navbar = () => {
  const { user, profile, session, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <Cpu className="text-white" size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-800">
            EconLogic <span className="text-blue-600 uppercase text-sm">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                <User size={14} />
                <span className="font-medium">{profile?.full_name || user?.email}</span>
                {profile?.role && (
                  <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                    {profile.role}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="登出"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
