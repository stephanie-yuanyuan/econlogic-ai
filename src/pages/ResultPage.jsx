import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ScoreCard from '../components/ScoreCard';
import LogicChain from '../components/LogicChain';
import FeedbackCard from '../components/FeedbackCard';
import ProcessingSpinner from '../components/ProcessingSpinner';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('submissions')
          .select('*, units(name, code)')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setSubmission(data);
      } catch (err) {
        console.error('Failed to fetch submission:', err);
        setError('无法加载提交记录');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-blue-600 animate-spin" size={48} />
        </div>
      </main>
    );
  }

  if (error || !submission) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            {error || '未找到提交记录'}
          </h2>
          <button
            onClick={() => navigate('/history')}
            className="text-blue-600 font-medium hover:underline"
          >
            返回历史记录
          </button>
        </div>
      </main>
    );
  }

  // If submission is still processing
  if (submission.status === 'pending' || submission.status === 'processing') {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12">
        <ProcessingSpinner
          message={
            submission.status === 'pending'
              ? '等待处理中...'
              : '正在对比专家库逻辑链...'
          }
        />
        <div className="text-center mt-4">
          <p className="text-sm text-slate-400">
            AI 评分功能将在 Phase 2 上线。当前提交已保存。
          </p>
          <button
            onClick={() => navigate('/submit')}
            className="mt-4 text-blue-600 text-sm font-bold hover:underline"
          >
            提交新论文
          </button>
        </div>
      </main>
    );
  }

  // Completed submission with results
  const result = submission.result_json;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-8">
        {/* Unit info */}
        <div className="text-center">
          <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">
            {submission.units?.name || 'Unknown Unit'}
          </span>
        </div>

        {result ? (
          <>
            <ScoreCard
              score={result.score || submission.score}
              maxScore={result.maxScore || 25}
              breakdown={result.breakdown}
              grade={result.grade || submission.grade}
            />
            <LogicChain logicGap={result.logicGap} />
            <FeedbackCard
              feedback={result.feedback || submission.feedback}
              onReset={() => navigate('/submit')}
            />
          </>
        ) : (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              评分结果暂未生成
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              AI 评分功能将在 Phase 2 上线。你的论文已安全保存。
            </p>
            <button
              onClick={() => navigate('/submit')}
              className="text-blue-600 text-sm font-bold hover:underline"
            >
              提交新论文
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default ResultPage;
