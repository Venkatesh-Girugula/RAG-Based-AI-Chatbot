import React, { useState } from 'react';
import { 
  Cpu, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Telemetry details mock dataset
  const weeklyData = [
    { label: 'Mon', prompt: 45000, completion: 65000, total: 110000, cost: 0.016 },
    { label: 'Tue', prompt: 58000, completion: 82000, total: 140000, cost: 0.021 },
    { label: 'Wed', prompt: 72000, completion: 98000, total: 170000, cost: 0.025 },
    { label: 'Thu', prompt: 68000, completion: 88000, total: 156000, cost: 0.023 },
    { label: 'Fri', prompt: 95000, completion: 125000, total: 220000, cost: 0.033 },
    { label: 'Sat', prompt: 32000, completion: 48000, total: 80000, cost: 0.012 },
    { label: 'Sun', prompt: 28000, completion: 42000, total: 70000, cost: 0.010 }
  ];

  const totalTokens = weeklyData.reduce((acc, curr) => acc + curr.total, 0);
  const totalPromptTokens = weeklyData.reduce((acc, curr) => acc + curr.prompt, 0);
  const totalCompletionTokens = weeklyData.reduce((acc, curr) => acc + curr.completion, 0);
  const totalCost = weeklyData.reduce((acc, curr) => acc + curr.cost, 0);

  // SVG dimensions for responsive chart
  const width = 500;
  const height = 180;
  const padding = 35;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Max value for scaling
  const maxTotal = Math.max(...weeklyData.map(d => d.total));
  
  // Calculate SVG points for token area chart
  const points = weeklyData.map((d, i) => {
    const x = padding + (i * (chartWidth / (weeklyData.length - 1)));
    const y = height - padding - (d.total * (chartHeight / maxTotal));
    return `${x},${y}`;
  }).join(' ');

  const closedPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <div className="space-y-6">
      
      {/* Timeframe selector header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-200">Corporate Token Consumption</h2>
          <p className="text-[10px] text-slate-500">Real-time usage and financial cost estimation</p>
        </div>

        <div className="flex gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-900">
          {(['daily', 'weekly', 'monthly'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setTimeframe(mode)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                timeframe === mode 
                  ? 'bg-brand-500/10 text-brand-300' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Token consumption card */}
        <div className="glass-panel border border-slate-900 rounded-2xl p-4.5 shadow-glass flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 shrink-0">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Total Tokens Consumed</span>
            <h3 className="text-lg font-extrabold text-slate-100 font-mono tracking-tight">{(totalTokens / 1000).toFixed(0)}k</h3>
            <span className="text-[9px] text-slate-600 font-mono font-medium block mt-1">Prompt: {totalPromptTokens.toLocaleString()} // Compl: {totalCompletionTokens.toLocaleString()}</span>
          </div>
        </div>

        {/* Cost card */}
        <div className="glass-panel border border-slate-900 rounded-2xl p-4.5 shadow-glass flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Accrued Cost (USD)</span>
            <h3 className="text-lg font-extrabold text-emerald-400 font-mono tracking-tight">${totalCost.toFixed(3)}</h3>
            <span className="text-[9px] text-slate-600 font-mono font-medium block mt-1">Rate: $0.15 per million tokens</span>
          </div>
        </div>

        {/* Usage card */}
        <div className="glass-panel border border-slate-900 rounded-2xl p-4.5 shadow-glass flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Average Daily Tokens</span>
            <h3 className="text-lg font-extrabold text-slate-100 font-mono tracking-tight">{(totalTokens / weeklyData.length / 1000).toFixed(1)}k</h3>
            <span className="text-[9px] text-slate-600 font-mono font-medium block mt-1">Activity peak: Friday (220k tokens)</span>
          </div>
        </div>

      </div>

      {/* SVG Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Token consumption curve */}
        <div className="glass-panel border border-slate-900 rounded-2xl p-5 shadow-glass space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Token Consumption Trend</span>
          
          <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0e91eb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0e91eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y Axis Grid lines */}
              {[0, 0.5, 1].map((ratio, index) => {
                const y = padding + (chartHeight * ratio);
                return (
                  <g key={index} className="opacity-20">
                    <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
                    <text x={padding - 8} y={y + 4} fill="#64748b" fontSize="8" textAnchor="end" fontFamily="monospace">
                      {((maxTotal * (1 - ratio)) / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* Filled Area under Curve */}
              <polygon points={closedPoints} fill="url(#areaGrad)" />

              {/* Line Curve */}
              <polyline points={points} fill="none" stroke="#0e91eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Dots on nodes */}
              {weeklyData.map((d, i) => {
                const x = padding + (i * (chartWidth / (weeklyData.length - 1)));
                const y = height - padding - (d.total * (chartHeight / maxTotal));
                return (
                  <circle 
                    key={i} 
                    cx={x} 
                    cy={y} 
                    r="4" 
                    fill="#090d16" 
                    stroke="#38abfa" 
                    strokeWidth="2" 
                    className="hover:scale-125 hover:r-5 cursor-pointer transition-all"
                  />
                );
              })}

              {/* X Axis Labels */}
              {weeklyData.map((d, i) => {
                const x = padding + (i * (chartWidth / (weeklyData.length - 1)));
                return (
                  <text key={i} x={x} y={height - padding + 15} fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif" fontWeight="500">
                    {d.label}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Stacked bar ratio chart */}
        <div className="glass-panel border border-slate-900 rounded-2xl p-5 shadow-glass space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Prompt vs Completion Ratio</span>
          
          <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
              
              {/* Y Grid lines */}
              {[0, 0.5, 1].map((ratio, index) => {
                const y = padding + (chartHeight * ratio);
                return (
                  <g key={index} className="opacity-20">
                    <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
                  </g>
                );
              })}

              {/* Vertical Stacked Bars */}
              {weeklyData.map((d, i) => {
                const barWidth = 20;
                const x = padding + (i * (chartWidth / (weeklyData.length - 1))) - (barWidth / 2);
                
                // Scale prompt and completion height
                const promptH = d.prompt * (chartHeight / maxTotal);
                const complH = d.completion * (chartHeight / maxTotal);
                
                const promptY = height - padding - promptH;
                const complY = promptY - complH;

                return (
                  <g key={i} className="transition-all hover:opacity-85">
                    {/* Prompt Part (Darker Blue) */}
                    <rect 
                      x={x} 
                      y={promptY} 
                      width={barWidth} 
                      height={promptH} 
                      fill="#074e87" 
                      rx="3"
                    />
                    {/* Completion Part (Lighter Cyan) */}
                    <rect 
                      x={x} 
                      y={complY} 
                      width={barWidth} 
                      height={complH} 
                      fill="#38abfa" 
                      rx="3"
                    />
                  </g>
                );
              })}

              {/* Axis Labels */}
              {weeklyData.map((d, i) => {
                const x = padding + (i * (chartWidth / (weeklyData.length - 1)));
                return (
                  <text key={i} x={x} y={height - padding + 15} fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif" fontWeight="500">
                    {d.label}
                  </text>
                );
              })}
            </svg>
          </div>
          
          {/* Legend indicator */}
          <div className="flex justify-center gap-6 pt-1 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-2"><span className="h-3 w-3 bg-brand-800 rounded-sm" /> Prompt Tokens</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 bg-brand-400 rounded-sm" /> Completion Tokens</span>
          </div>
        </div>

      </div>

    </div>
  );
};
export default AnalyticsCharts;
