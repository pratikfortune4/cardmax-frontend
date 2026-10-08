'use client'

import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface CreditLimitChartProps {
  data: Array<{ name: string; value: number }>
}

const COLORS = ['#4f46e5', '#8b5cf6', '#38bdf8', '#c084fc', '#818cf8', '#0ea5e9']

export const CreditLimitChart: React.FC<CreditLimitChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="cm-chart-empty">
        <p>No credit cards available to show limits.</p>
      </div>
    )
  }

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="cm-credit-limit-wrapper">
      <div style={{ width: '160px', height: '160px', position: 'relative', flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatCurrency} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total</span>
          <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 800 }}>
            {new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(total)}
          </span>
        </div>
      </div>

      <div className="cm-credit-limit-legend">
        {data.map((entry, index) => {
          const percent = ((entry.value / total) * 100).toFixed(0)
          return (
            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length], flexShrink: 0 }} />
                <span style={{ color: '#475569', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {entry.name}
                </span>
              </div>
              <div style={{ color: '#0f172a', fontWeight: 700, marginLeft: '0.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(entry.value)}
                <span style={{ color: '#94a3b8', fontSize: '0.7rem', marginLeft: '0.2rem' }}>({percent}%)</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
