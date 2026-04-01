import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

const SubmitPage = () => {
  const [essay, setEssay] = useState('');
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [error, setError] = useState('');

  const { session } = useAuthStore();
  const navigate = useNavigate();

  // Fetch units directly from Supabase (no backend needed)
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('units')
          .select('id, name, code, description')
          .eq('is_active', true)
          .order('code');
        if (fetchError) throw fetchError;
        setUnits(data || []);
        if (data && data.length > 0) {
          setSelectedUnit(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch units:', err);
        setError('无法加载教学单元，请稍后重试');
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchUnits();
  }, []);

  const handleSubmit = async () => {
    if (!essay.trim()) {
      setError('请输入论文内容');
      return;
    }
    if (!selectedUnit) {
      setError('请选择教学单元');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create submission record in Supabase
      const { data, error: insertError } = await supabase
        .from('submissions')
        .insert({
          user_id: session.user.id,
          unit_id: selectedUnit,
          essay_text: essay,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Navigate to result page (Phase 2 will add AI processing)
      navigate(`/result/${data.id}`);
    } catch (err) {
      console.error('Submission failed:', err);
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
          <p className="text-slate-500 max-w-lg mx-auto">
            针对 A-Level/IB 深度开发，识别传导机制中的断裂点。
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex gap-4 mb-6">
            {loadingUnits ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                加载单元中...
              </div>
            ) : (
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-blue-600 outline-none focus:ring-2 ring-blue-500/20"
              >
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            className="w-full h-64 bg-slate-50/50 rounded-2xl p-6 text-lg border-none outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:text-slate-300"
            placeholder="在此输入您的论文文章，例如：The central bank increases interest rates, which directly leads to a decrease in consumer spending..."
          />

          {error && (
            <div className="mt-4 bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || loadingUnits}
            className="w-full mt-6 bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                提交中...
              </>
            ) : (
              <>
                开始深度逻辑诊断{' '}
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
