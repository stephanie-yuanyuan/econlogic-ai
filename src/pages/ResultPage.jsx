import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ScoreCard from '../components/ScoreCard';
import LogicChain from '../components/LogicChain';
import FeedbackCard from '../components/FeedbackCard';

const AOFeedbackCard = ({ aoFeedback, scores }) => {
  const aoColors = {
    ao1: 'bg-blue-50 border-blue-100 text-blue-700',
    ao2: 'bg-green-50 border-green-100 text-green-700',
    ao3: 'bg-orange-50 border-orange-100 text-orange-700',
    ao4: 'bg-purple-50 border-purple-100 text-purple-700',
  };
  const aoMax = { ao1: 4, ao2: 4, ao3: 6, ao4: 6 };
  const aoLabels = { ao1: 'AO1 知识', ao2: 'AO2 应用', ao3: 'AO3 分析', ao4: 'AO4 评估' };

  if (!aoFeedback) return null;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100">
      <h3 className="font-bold text-lg mb-6 text-slate-900">分项评分详情</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(aoFeedback).map(([ao, feedback]) => (
          <div key={ao} className={`p-4 rounded-2xl border ${aoColors[ao]}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm">{aoLabels[ao]}</span>
              <span className="font-black text-lg">{scores[ao]}<span className="text-xs font-normal opacity-60">/{aoMax[ao]}</span></span>
            </div>
            <p className="text-xs opacity-80 leading-relaxed">{feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let timeout;

    const fetchSubmission = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('submissions')
          .select('*, units(name, code)')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setSubmission(data);

        if (data.status === 'pending' || data.status === 'processing') {
          timeout = setTimeout(fetchSubmission, 2000);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError('无法加载评分结果：' + err.message);
        setLoading(false);
      }
    };

    fetchSubmission();
    return () => clearTimeout(timeout);
  }, [id]);

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/submit" className="text-blue-600 hover:underline">重新提交</Link>
      </main>
    );
  }

  if (!submission || submission.status === 'pending' || submission.status === 'processing') {
    return (
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <Loader2 className="text-blue-600 animate-spin" size={64} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full animate-ping" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">AI 正在评分中...</h3>
            <p className="text-slate-400 text-sm mt-2">正在对照 Edexcel 评分标准分析你的论文</p>
            <p className="text-slate-300 text-xs mt-1 font-mono">{submission?.units?.name}</p>
          </div>
        </div>
      </main>
    );
  }

  if (submission.status === 'error') {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12 text-center space-y-4">
        <p className="text-red-500 text-lg font-bold">评分失败，请重试</p>
        <Link to="/submit" className="text-blue-600 hover:underline block">重新提交</Link>
      </main>
    );
  }

  const result = submission.result_json;
  if (!result) return null;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono mb-1">{submission.units?.name}</p>
            <h1 className="text-2xl font-black text-slate-900">评分结果</h1>
          </div>
          <Link to="/submit" className="flex items-center gap-1 text-sm text-slate-400 hover:text-blue-600 transition-colors">
            <ArrowLeft size={14} /> 重新提交
          </Link>
        </div>

        {result.strengths && (
          <div className="bg-green-50 border border-green-100 rounded-2xl px-6 py-4">
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">论文亮点</p>
            <p className="text-sm text-green-800">{result.strengths}</p>
          </div>
        )}

        <ScoreCard
          score={submission.score}
          maxScore={20}
          breakdown={result.scores}
          grade={result.grade}
        />

        <AOFeedbackCard aoFeedback={result.aoFeedback} scores={result.scores} />

        {result.logicGap?.hasGap && <LogicChain logicGap={result.logicGap} />}

        <FeedbackCard
          feedback={result.feedback}
          onReset={() => navigate('/submit')}
        />
      </div>
    </main>
  );
};

export default ResultPage;
