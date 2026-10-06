'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

interface RewardMultiplierChartProps {
  data: Array<{ cardName: string; value: number; type: 'cashback' | 'points' }>
}

export const RewardMultiplierChart: React.FC<RewardMultiplierChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="cm-chart-empty">
        <p>No recommendation data available yet.</p>
      </div>
    )
  }

  const customTooltipFormatter = (val: number, name: string, props: any) => {
    const isCashback = props.payload.type === 'cashback'
    return [
      `${val}${isCashback ? '%' : 'x'}`,
      'Reward Value'
    ]
  }

  const CustomLabel = (props: any) => {
    const { x, y, width, height, value, index } = props;
    const isCashback = data[index]?.type === 'cashback';
    return (
      <text x={x + width + 5} y={y + height / 2} dy={4} fill="#0f172a" fontSize={11} fontWeight={700}>
        {value}{isCashback ? '%' : 'x'}
      </text>
    );
  };

  const customTickFormatter = (value: string) => {
    if (value.length > 18) {
      return value.substring(0, 16) + '...';
    }
    return value;
  }

  return (
    <div style={{ width: '100%', flex: 1, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorReward" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <XAxis type="number" hide />
          <YAxis dataKey="cardName" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#475569' }} width={120} tickFormatter={customTickFormatter} />
          <Tooltip 
            cursor={{ fill: '#f4f6fc' }} 
            formatter={customTooltipFormatter} 
          />
          <Bar dataKey="value" fill="url(#colorReward)" radius={[0, 4, 4, 0]} maxBarSize={24}>
            <LabelList content={<CustomLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
