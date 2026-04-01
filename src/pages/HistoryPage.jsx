import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const HistoryPage = () => {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            提交历史
          </h1>
          <p className="text-slate-500">查看你的论文提交记录和诊断结果</p>
        </div>

        <div className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
          <div className="bg-slate-100 p-4 rounded-2xl w-fit mx-auto mb-6">
            <Clock className="text-slate-400" size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">暂无提交记录</h3>
          <p className="text-sm text-slate-500 mb-6">
            提交你的第一篇论文，开始获取 AI 逻辑诊断
          </p>
          <Link
            to="/submit"
            className="inline-block bg-slate-900 text-white font-bold px-8 py-3 rounded-2xl shadow-lg hover:bg-blue-600 transition-all active:scale-95"
          >
            去提交论文
          </Link>
        </div>
      </div>
    </main>
  );
};

export default HistoryPage;
