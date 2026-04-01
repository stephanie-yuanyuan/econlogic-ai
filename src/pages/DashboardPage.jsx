import { Link } from 'react-router-dom';
import { Sparkles, FileText, Clock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const DashboardPage = () => {
  const { user, profile } = useAuthStore();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || '用户';

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            欢迎回来，{displayName}
          </h1>
          <div className="flex items-center justify-center gap-2">
            {profile?.role && (
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
                {profile.role}
              </span>
            )}
            <p className="text-slate-500">准备好提交你的论文了吗？</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/submit"
            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all group"
          >
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">提交论文</h3>
            <p className="text-sm text-slate-500">
              上传你的经济学论文，获取 AI 深度逻辑诊断
            </p>
          </Link>

          <Link
            to="/history"
            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all group"
          >
            <div className="bg-slate-700 p-3 rounded-xl shadow-lg shadow-slate-200 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Clock className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">历史记录</h3>
            <p className="text-sm text-slate-500">
              查看过往提交记录和诊断结果
            </p>
          </Link>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl shadow-blue-200 text-white">
            <div className="bg-white/20 p-3 rounded-xl w-fit mb-4">
              <FileText className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">资料库</h3>
            <p className="text-sm text-blue-100">
              范文库和评分标准（即将上线）
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
