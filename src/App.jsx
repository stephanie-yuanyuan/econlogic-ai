import React, { useState } from 'react';
import {
  Cpu,
  Activity,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Loader2,
  Sparkles
} from 'lucide-react';

const App = () => {
  const [step, setStep] = useState('input');
  const [essay, setEssay] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const runAnalysis = async () => {
    setStep('processing');

    await new Promise(r => setTimeout(r, 3000));

    setAnalysis({
      score: 18,
      breakdown: { ao1: 5, ao3: 8, ao4: 5 },
      logicGap: {
        title: "逻辑跳步 (Logical Jump)",
        description: "你直接从利率上升跳到了消费下降，缺失了中间的传导环节。",
        chain: [
          { text: "Interest Rate ↑", status: "ok" },
          { text: "Cost of Borrowing ↑", status: "missing" },
          { text: "Disposable Income ↓", status: "missing" },
          { text: "Consumption ↓", status: "ok" }
        ]
      },
      feedback: "整体论证有力，但传导机制在 AO3 部分显得单薄。建议补充利率对个人财务状况的具体影响。"
    });
    setStep('result');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans selection:bg-blue-100">
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <Cpu className="text-white" size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-800">
              EconLogic <span className="text-blue-600 uppercase text-sm">AI</span>
            </span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
            <button className="hover:text-blue-600">资料库</button>
            <button className="hover:text-blue-600">教学演示</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {step === 'input' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                AI 驱动的经济学<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">逻辑链条诊断引擎</span>
              </h1>
              <p className="text-slate-500 max-w-lg mx-auto">
                针对 A-Level/IB 深度开发，识别传导机制中的断裂点。
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex gap-4 mb-6">
                <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-blue-600 outline-none">
                  <option>Unit 6: Macroeconomic Policy</option>
                  <option>Unit 3: Production & Costs</option>
                </select>
              </div>
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                className="w-full h-64 bg-slate-50/50 rounded-2xl p-6 text-lg border-none outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:text-slate-300"
                placeholder="在此输入您的论文文章，例如：The central bank increases interest rates, which directly leads to a decrease in consumer spending..."
              />
              <button
                onClick={runAnalysis}
                className="w-full mt-6 bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2 group"
              >
                开始深度逻辑诊断 <Sparkles size={18} className="group-hover:animate-pulse" />
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-20 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <Loader2 className="text-blue-600 animate-spin" size={64} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full animate-ping" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">正在对比专家库逻辑链...</h3>
              <p className="text-slate-400 text-sm mt-2 font-mono">Comparing with U6-Logic-Chain-Standard...</p>
            </div>
          </div>
        )}

        {step === 'result' && analysis && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Score</h4>
                  <div className="flex items-end gap-2">
                    <span className="text-6xl font-black text-slate-900">{analysis.score}</span>
                    <span className="text-xl font-bold text-slate-300 mb-2">/25</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  {Object.entries(analysis.breakdown).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{key}</div>
                      <div className="text-lg font-bold text-blue-600">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
                <BarChart3 className="mb-4 opacity-50" />
                <h4 className="font-bold">诊断等级：B+</h4>
                <p className="text-xs text-blue-100 mt-2 italic">"逻辑完整度超过了 75% 的同级别考生"</p>
              </div>
            </div>

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
                  {analysis.logicGap.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {analysis.logicGap.chain.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <div className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                      item.status === 'missing'
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-bounce'
                      : 'bg-white border border-slate-200 text-slate-500'
                    }`}>
                      {item.text}
                    </div>
                    {idx < analysis.logicGap.chain.length - 1 && <ArrowRight size={16} className="text-slate-300" />}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-6 p-4 bg-white border border-dashed border-red-200 rounded-2xl">
                <div className="text-[10px] text-red-400 font-bold uppercase mb-1">建议补全内容</div>
                <div className="text-xs text-slate-600 font-medium italic">"...which leads to a rise in borrowing costs for households, reducing their monthly disposable income..."</div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" /> 阅卷官建议
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {analysis.feedback}
              </p>
              <button
                onClick={() => setStep('input')}
                className="mt-8 text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
              >
                重新测试另一篇论文 <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
