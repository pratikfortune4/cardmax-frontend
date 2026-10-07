import { IconCalendar, IconInfo } from '@/components/Icons';
import React from 'react';
import './AnalysisPeriodSelector.scss';

export interface AnalysisPeriodSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const OPTIONS = [
  {
    value: 3,
    label: '3 months',
    description: 'Quick analysis (basic insights)',
  },
  {
    value: 6,
    label: '6 months',
    description: 'More insights (better accuracy)',
  },
  {
    value: 9,
    label: '9 months',
    description: 'Extended analysis (deep insights)',
  },
  {
    value: 12,
    label: '12 months',
    description: 'Most accurate results (full-year view)',
    recommended: true,
  },
];

export const AnalysisPeriodSelector: React.FC<AnalysisPeriodSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="analysis-period-selector" role="radiogroup" aria-labelledby="aps-title">
      <div className="aps-header">
        <h3 id="aps-title">Choose your analysis period</h3>
        <p>Select how many months of statements to analyse. A longer period gives more accurate recommendations.</p>
      </div>

      <div className="aps-options">
        {OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={`aps-option-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            >
              <input
                type="radio"
                name="analysis-period"
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                disabled={disabled}
                className="sr-only"
              />
              <div className="aps-option-icon">
                <IconCalendar width="24" height="24" />
              </div>
              <div className="aps-option-content">
                <div className="aps-option-title">
                  {option.label}
                  {option.recommended && <span className="aps-recommended-badge">Recommended</span>}
                </div>
                <div className="aps-option-description">{option.description}</div>
              </div>
              <div className="aps-radio-indicator">
                <div className="aps-radio-inner"></div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="aps-info-box">
        <div className="aps-info-icon">
          <IconInfo width="20" height="20" />
        </div>
        <div className="aps-info-text">
          Shorter analysis periods may reduce recommendation accuracy, as we&apos;ll have less data to understand your spending patterns.
        </div>
      </div>
    </div>
  );
};
