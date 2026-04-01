import { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Target, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const aoColors = {
  AO1: 'bg-blue-100 text-blue-700 border-blue-200',
  AO2: 'bg-green-100 text-green-700 border-green-200',
  AO3: 'bg-orange-100 text-orange-700 border-orange-200',
  AO4: 'bg-purple-100 text-purple-700 border-purple-200',
};

const aoLabels = {
  AO1: '知识与理解',
  AO2: '应用',
  AO3: '分析',
  AO4: '评估',
};

const RubricCard = ({ rubric }) => {
  const [expanded, setExpanded] = useState(false);
  const criteria = rubric.criteria || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Target size={16} className="text-blue-500" />
          <span className="font-semibold text-slate-700 text-sm">{rubric.title}</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-slate-50">
          {/* AO score summary */}
          <div className="flex flex-wrap gap-2 pt-4">
            {criteria.map((c) => (
              <span key={c.ao} className={`text-xs font-bold px-3 py-1 rounded-full border ${aoColors[c.ao] || 'bg-slate-100 text-slate-600'}`}>
                {c.ao} {aoLabels[c.ao]} — {c.max_score}分
              </span>
            ))}
          </div>

          {/* Each AO detail */}
          {criteria.map((c) => (
            <div key={c.ao} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${aoColors[c.ao] || ''}`}>{c.ao}</span>
                <span className="text-sm font-semibold text-slate-700">{c.label}</span>
                <span className="text-xs text-slate-400 ml-auto">满分 {c.max_score} 分</span>
              </div>

              {/* Descriptors */}
              {c.descriptors && (
                <div className="space-y-1 pl-4">
                  {c.descriptors.slice(0, 3).map((d, i) => (
                    <div key={i} className="text-xs text-slate-500 flex gap-2">
                      <span className="text-slate-300 mt-0.5">•</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Key concepts */}
              {c.key_concepts && (
                <div className="pl-4 flex flex-wrap gap-1">
                  {c.key_concepts.map((k, i) => (
                    <span key={i} className="text-[11px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                      {k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const UnitCard = ({ unit, rubrics }) => {
  const [expanded, setExpanded] = useState(false);
  const unitRubrics = rubrics.filter(r => r.unit_id === unit.id);
  const totalScore = unit.ao_weights
    ? Object.values(unit.ao_weights).reduce((a, b) => a + b, 0)
    : unit.max_score;

  return (
    <div className="bg-white rounded-[2rem] shadow-lg border border-slate-100 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-8 text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs font-black px-2 py-1 rounded-lg">
                {unit.code}
              </span>
              <span className="text-xs text-slate-400 font-mono">满分 {unit.max_score} 分</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">{unit.name}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{unit.description}</p>
          </div>
          <div className="flex-shrink-0">
            {expanded
              ? <ChevronUp className="text-slate-400" size={20} />
              : <ChevronDown className="text-slate-400" size={20} />
            }
          </div>
        </div>

        {/* AO weights bar */}
        {unit.ao_weights && (
          <div className="mt-6 space-y-2">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">评分权重</div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(unit.ao_weights).map(([ao, score]) => (
                <div key={ao} className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${aoColors[ao.toUpperCase()] || 'bg-slate-100'}`}>
                    {ao.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">{score}分</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </button>

      {expanded && unitRubrics.length > 0 && (
        <div className="px-8 pb-8 space-y-3 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">评分标准</span>
          </div>
          {unitRubrics.map(r => (
            <RubricCard key={r.id} rubric={r} />
          ))}
        </div>
      )}

      {expanded && unitRubrics.length === 0 && (
        <div className="px-8 pb-8 border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-400 text-center py-4">暂无评分标准</p>
        </div>
      )}
    </div>
  );
};

const ResourcesPage = () => {
  const [units, setUnits] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: unitsData }, { data: rubricsData }] = await Promise.all([
          supabase.from('units').select('*').eq('is_active', true).order('code'),
          supabase.from('rubrics').select('*').eq('is_active', true),
        ]);
        setUnits(unitsData || []);
        setRubrics(rubricsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="bg-blue-50 p-3 rounded-2xl w-fit mx-auto">
            <BookOpen className="text-blue-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">资料库</h1>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Pearson Edexcel IAL 经济学评分标准，基于官方教材整理
          </p>
        </div>

        {/* Units */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            加载中...
          </div>
        ) : (
          <div className="space-y-4">
            {units.map(unit => (
              <UnitCard key={unit.id} unit={unit} rubrics={rubrics} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ResourcesPage;
