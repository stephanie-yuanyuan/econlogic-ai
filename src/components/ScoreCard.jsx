import { BarChart3 } from 'lucide-react';

const ScoreCard = ({ score, maxScore = 25, breakdown, grade = 'B+' }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 flex items-center justify-between">
        <div>
          <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
            Total Score
          </h4>
          <div className="flex items-end gap-2">
            <span className="text-6xl font-black text-slate-900">{score}</span>
            <span className="text-xl font-bold text-slate-300 mb-2">/{maxScore}</span>
          </div>
        </div>
        <div className="flex gap-4">
          {breakdown &&
            Object.entries(breakdown).map(([key, val]) => (
              <div key={key} className="text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">{key}</div>
                <div className="text-lg font-bold text-blue-600">{val}</div>
              </div>
            ))}
        </div>
      </div>
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
        <BarChart3 className="mb-4 opacity-50" />
        <h4 className="font-bold">诊断等级：{grade}</h4>
        <p className="text-xs text-blue-100 mt-2 italic">
          "逻辑完整度超过了 75% 的同级别考生"
        </p>
      </div>
    </div>
  );
};

export default ScoreCard;
