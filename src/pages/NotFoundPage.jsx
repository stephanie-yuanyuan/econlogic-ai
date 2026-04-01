import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center py-20 space-y-6">
        <div className="bg-slate-100 p-4 rounded-2xl w-fit mx-auto">
          <AlertCircle className="text-slate-400" size={64} />
        </div>
        <div>
          <h1 className="text-6xl font-black text-slate-900 mb-2">404</h1>
          <p className="text-slate-500 text-lg">页面未找到</p>
        </div>
        <Link
          to="/dashboard"
          className="inline-block bg-slate-900 text-white font-bold px-8 py-3 rounded-2xl shadow-lg hover:bg-blue-600 transition-all active:scale-95"
        >
          返回首页
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;
