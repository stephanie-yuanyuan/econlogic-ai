import { CheckCircle, ArrowRight } from 'lucide-react';

const FeedbackCard = ({ feedback, onReset }) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <CheckCircle size={18} className="text-green-500" /> 阅卷官建议
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed">{feedback}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-8 text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
        >
          重新测试另一篇论文 <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
};

export default FeedbackCard;
