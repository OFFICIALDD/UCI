import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { QualityMetrics } from '../types';

interface QualityChartProps {
  metrics: QualityMetrics;
}

const QualityChart: React.FC<QualityChartProps> = ({ metrics }) => {
  const data = [
    { subject: 'Readability', A: metrics.readability, fullMark: 10 },
    { subject: 'Maintainability', A: metrics.maintainability, fullMark: 10 },
    { subject: 'Security', A: metrics.security, fullMark: 10 },
    { subject: 'Performance', A: metrics.performance, fullMark: 10 },
    { subject: 'Structure', A: metrics.structure, fullMark: 10 },
  ];

  return (
    <div className="h-64 w-full bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-xl">
      <h3 className="text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wider">Quality Scorecard</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#8B5CF6"
            strokeWidth={2}
            fill="#8B5CF6"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
            itemStyle={{ color: '#8B5CF6' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QualityChart;