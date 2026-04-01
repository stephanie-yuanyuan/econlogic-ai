import { Loader2 } from 'lucide-react';

const ProcessingSpinner = ({ message = '正在对比专家库逻辑链...' }) => {
  return (
    <div className="py-20 flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <Loader2 className="text-blue-600 animate-spin" size={64} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full animate-ping" />
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold">{message}</h3>
        <p className="text-slate-400 text-sm mt-2 font-mono">
          Comparing with Logic-Chain-Standard...
        </p>
      </div>
    </div>
  );
};

export default ProcessingSpinner;
