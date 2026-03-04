import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';

export default function ProgressChart({ data, masteryLine = 80 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
        No data yet — log a session to see progress
      </div>
    );
  }

  const chartData = data.map(dp => ({
    date: new Date(dp.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    correct: parseFloat(dp.percentage_correct),
    trials: dp.total_trials,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
          tickFormatter={v => `${v}%`} />
        <Tooltip
          formatter={(value, name) => name === 'correct' ? [`${value}%`, '% Correct'] : [value, 'Trials']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
        />
        <ReferenceLine y={masteryLine} stroke="#22c55e" strokeDasharray="4 4"
          label={{ value: `Mastery (${masteryLine}%)`, position: 'right', fontSize: 10, fill: '#22c55e' }} />
        <Line
          type="monotone" dataKey="correct" stroke="#3b82f6" strokeWidth={2.5}
          dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
