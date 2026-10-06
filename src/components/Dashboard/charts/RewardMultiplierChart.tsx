'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RewardMultiplierChartProps {
  data: Array<{ cardName: string; value: number; type: 'cashback' | 'points' }>
}

export const RewardMultiplierChart: React.FC<RewardMultiplierChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="cm-chart-empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#64748b' }}>
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

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="cardName" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <Tooltip 
            cursor={{ fill: '#f4f6fc' }} 
            formatter={customTooltipFormatter} 
          />
          <Bar dataKey="value" fill="#38bdf8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
