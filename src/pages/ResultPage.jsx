import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle, XCircle, AlertCircle, Database } from 'lucide-react';
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
              <span className="font-black text-lg">{scores?.[ao] ?? '—'}<span className="text-xs font-normal opacity-60">/{aoMax[ao]}</span></span>
            </div>
            <p className="text-xs opacity-80 leading-relaxed">{feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const MissingPointsCard = ({ missingPoints, coveredPoints }) => {
  if (!missingPoints?.length && !coveredPoints?.length) return null;
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100">
      <h3 className="font-bold text-lg mb-6 text-slate-900">知识点覆盖分析</h3>
      {coveredPoints?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">✅ 已覆盖（{coveredPoints.length}个）</p>
          <div className="flex flex-wrap gap-2">
            {coveredPoints.map((p, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full">
                <CheckCircle size={10} /> {p}
              </span>
            ))}
          </div>
        </div>
      )}
      {missingPoints?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3">❌ 缺失知识点（{missingPoints.length}个）</p>
          <div className="space-y-3">
            {missingPoints.map((mp, i) => (
              <div key={i} className="flex gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700">{mp.point}</p>
                  <p className="text-xs text-red-500 mt-0.5">{mp.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LogicGapAnalysisCard = ({ logicGapAnalysis }) => {
  if (!logicGapAnalysis?.length) return null;
  const hasGaps = logicGapAnalysis.some(c => c.missingSteps?.length > 0);
  if (!hasGaps) return null;
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-red-50">
      <div className="flex items-center gap-2 text-red-600 mb-6">
        <AlertCircle size={20} />
        <h3 className="font-bold text-lg">逻辑链断层分析</h3>
      </div>
      <div className="space-y-6">
        {logicGapAnalysis.filter(c => c.missingSteps?.length > 0).map((chain, i) => (
          <div key={i} className="bg-red-50/50 rounded-2xl p-5 border border-red-100">
            <p className="text-sm font-bold text-slate-700 mb-2">{chain.chainName}</p>
            <p className="text-xs text-slate-500 mb-3">你写到：{chain.studentVersion}</p>
            <div className="space-y-1.5 mb-3">
              <p className="text-xs font-bold text-red-500">缺失步骤：</p>
              {chain.missingSteps.map((step, j) => (
                <div key={j} className="flex gap-2 text-xs text-red-600 bg-white border border-red-200 rounded-xl px-3 py-2">
                  <span className="font-bold">→</span> {step}
                </div>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700">
              <span className="font-bold">建议：</span>{chain.suggestion}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DataReferenceCard = ({ dataReferenceCheck }) => {
  if (!dataReferenceCheck) return null;
  return (
    <div className={`p-6 rounded-2xl border ${dataReferenceCheck.cited ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Database size={16} className={dataReferenceCheck.cited ? 'text-green-600' : 'text-amber-600'} />
        <p className="text-sm font-bold">{dataReferenceCheck.cited ? '✅ 有引用材料数据' : '⚠️ 缺少材料数据引用'}</p>
      </div>
      {dataReferenceCheck.figuresCited?.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-bold text-green-600 mb-1">引用了：</p>
          <div className="flex flex-wrap gap-1">
            {dataReferenceCheck.figuresCited.map((f, i) => (
              <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      )}
      {dataReferenceCheck.missingFigures?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-amber-600 mb-1">未引用的重要数据：</p>
          <div className="flex flex-wrap gap-1">
            {dataReferenceCheck.missingFigures.map((f, i) => (
              <span key={i} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
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
        }
      } catch (err) {
        setError('无法加载评分结果：' + err.message);
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
            <p className="text-slate-400 text-sm mt-2">对照 Edexcel 评分标准逐一检查知识点与逻辑链</p>
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

  // 兼容旧版 logicGap 格式
  const legacyLogicGap = result.logicGap?.hasGap ? result.logicGap : null;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono mb-1">{submission.units?.name}</p>
            <h1 className="text-2xl font-black text-slate-900">评分结果</h1>
          </div>
          <Link to="/submit" className="flex items-center gap-1 text-sm text-slate-400 hover:text-blue-600 transition-colors">
            <ArrowLeft size={14} /> 重新提交
          </Link>
        </div>

        {/* 亮点 */}
        {result.strengths && (
          <div className="bg-green-50 border border-green-100 rounded-2xl px-6 py-4">
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">论文亮点</p>
            <p className="text-sm text-green-800">{result.strengths}</p>
          </div>
        )}

        {/* 总分 */}
        <ScoreCard score={submission.score} maxScore={result.scores?.total || submission.score} breakdown={result.scores} grade={result.grade} />

        {/* 数据引用检查（有材料题专属） */}
        <DataReferenceCard dataReferenceCheck={result.dataReferenceCheck} />

        {/* 知识点覆盖 */}
        <MissingPointsCard missingPoints={result.missingPoints} coveredPoints={result.coveredPoints} />

        {/* 逻辑链断层（新格式） */}
        <LogicGapAnalysisCard logicGapAnalysis={result.logicGapAnalysis} />

        {/* 逻辑链断层（旧格式兼容） */}
        {legacyLogicGap && <LogicChain logicGap={legacyLogicGap} />}

        {/* 分项评分 */}
        <AOFeedbackCard aoFeedback={result.aoFeedback} scores={result.scores} />

        {/* 综合建议 */}
        <FeedbackCard feedback={result.feedback} onReset={() => navigate('/submit')} />
      </div>
    </main>
  );
};

export default ResultPage;
