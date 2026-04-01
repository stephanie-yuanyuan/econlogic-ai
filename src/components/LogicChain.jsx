import React from 'react';
import { Activity, AlertCircle, ArrowRight } from 'lucide-react';

const LogicChain = ({ logicGap }) => {
  if (!logicGap) return null;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-red-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <Activity size={120} />
      </div>
      <div className="flex items-center gap-2 text-red-600 mb-6">
        <AlertCircle size={20} />
        <h3 className="font-bold">逻辑断层 (Logical Gap Analysis)</h3>
      </div>

      <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100 mb-8">
        <p className="text-sm text-slate-700 font-medium leading-relaxed">
          {logicGap.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {logicGap.chain.map((item, idx) => (
          <React.Fragment key={idx}>
            <div
              className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                item.status === 'missing'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-bounce'
                  : 'bg-white border border-slate-200 text-slate-500'
              }`}
            >
              {item.text}
            </div>
            {idx < logicGap.chain.length - 1 && (
              <ArrowRight size={16} className="text-slate-300" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-6 p-4 bg-white border border-dashed border-red-200 rounded-2xl">
        <div className="text-[10px] text-red-400 font-bold uppercase mb-1">
          建议补全内容
        </div>
        <div className="text-xs text-slate-600 font-medium italic">
          "...which leads to a rise in borrowing costs for households, reducing their
          monthly disposable income..."
        </div>
      </div>
    </div>
  );
};

export default LogicChain;
