import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, FileText, BookOpen } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

const SubmitPage = () => {
  const [essay, setEssay] = useState('');
  const [units, setUnits] = useState([]);
  const [markSchemes, setMarkSchemes] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedMarkScheme, setSelectedMarkScheme] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  const { session } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: unitsData }, { data: msData }] = await Promise.all([
          supabase.from('units').select('id, name, code').eq('is_active', true).order('code'),
          supabase.from('mark_schemes').select('id, question_code, title, question_type, total_marks, unit_id').eq('is_active', true).order('question_code'),
        ]);
        setUnits(unitsData || []);
        setMarkSchemes(msData || []);
        if (unitsData && unitsData.length > 0) setSelectedUnit(unitsData[0].id);
      } catch (err) {
        setError('无法加载数据，请稍后重试');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // 根据选中的 unit 过滤题目
  const filteredMarkSchemes = markSchemes.filter(ms => ms.unit_id === selectedUnit);

  // 切换 unit 时重置题目选择
  const handleUnitChange = (unitId) => {
    setSelectedUnit(unitId);
    setSelectedMarkScheme('');
  };

  const selectedMs = markSchemes.find(ms => ms.id === selectedMarkScheme);

  const handleSubmit = async () => {
    if (!essay.trim()) { setError('请输入你的答案'); return; }
    if (!selectedUnit) { setError('请选择教学单元'); return; }

    setIsSubmitting(true);
    setError('');

    try {
      const { data, error: insertError } = await supabase
        .from('submissions')
        .insert({
          user_id: session.user.id,
          unit_id: selectedUnit,
          essay_text: essay,
          status: 'pending',
          mark_scheme_id: selectedMarkScheme || null,
          question_type: selectedMs?.question_type || 'essay',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const gradeRes = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: data.id,
          markSchemeId: selectedMarkScheme || null,
        }),
      });

      if (!gradeRes.ok) {
        const err = await gradeRes.json();
        throw new Error(err.error || 'AI 评分失败');
      }

      navigate(`/result/${data.id}`);
    } catch (err) {
      setError('提交失败：' + (err.message || '未知错误'));
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            AI 驱动的经济学
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              逻辑链条诊断引擎
            </span>
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto text-sm">
            针对 Edexcel IAL 深度开发，精准识别逻辑断层与缺失知识点
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">

          {/* Step 1: 选单元 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={12} /> Step 1 · 选择教学单元
            </label>
            {loadingData ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 size={14} className="animate-spin" /> 加载中...
              </div>
            ) : (
              <select
                value={selectedUnit}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-blue-600 outline-none focus:ring-2 ring-blue-500/20"
              >
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Step 2: 选题目（可选） */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={12} /> Step 2 · 选择题目（可选，选了评分更精准）
            </label>
            {loadingData ? null : (
              <div className="space-y-2">
                {/* 不选题目选项 */}
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedMarkScheme === '' ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input
                    type="radio"
                    name="markScheme"
                    value=""
                    checked={selectedMarkScheme === ''}
                    onChange={() => setSelectedMarkScheme('')}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-700">通用评分（不选具体题目）</div>
                    <div className="text-xs text-slate-400">按 Edexcel 通用 AO1-AO4 评分标准批改</div>
                  </div>
                </label>

                {/* 有题目选项 */}
                {filteredMarkSchemes.length > 0 ? filteredMarkSchemes.map((ms) => (
                  <label key={ms.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedMarkScheme === ms.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input
                      type="radio"
                      name="markScheme"
                      value={ms.id}
                      checked={selectedMarkScheme === ms.id}
                      onChange={() => setSelectedMarkScheme(ms.id)}
                      className="text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ms.question_type === 'data_response' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                          {ms.question_type === 'data_response' ? '有材料题' : '论述题'}
                        </span>
                        <span className="text-xs text-slate-400">{ms.question_code} · {ms.total_marks}分</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-700 mt-0.5">{ms.title}</div>
                    </div>
                  </label>
                )) : (
                  <div className="text-xs text-slate-400 px-3 py-2">该单元暂无具体题目，使用通用评分</div>
                )}
              </div>
            )}
          </div>

          {/* Step 3: 输入答案 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Step 3 · 输入你的答案
            </label>
            {selectedMs && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 leading-relaxed">
                <span className="font-bold">题目：</span>{selectedMs.title}
              </div>
            )}
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              className="w-full h-64 bg-slate-50/50 rounded-2xl p-6 text-sm border border-slate-200 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:text-slate-300"
              placeholder="在此输入你的答案...&#10;&#10;例如：The central bank increases interest rates, which raises the cost of borrowing..."
            />
            <div className="text-right text-xs text-slate-300">{essay.length} 字符</div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || loadingData || !essay.trim()}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                AI 评分中，请稍候...
              </>
            ) : (
              <>
                开始深度逻辑诊断
                <Sparkles size={18} className="group-hover:animate-pulse" />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

export default SubmitPage;
