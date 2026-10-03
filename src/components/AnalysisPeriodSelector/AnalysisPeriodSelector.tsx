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
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
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
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="aps-info-text">
          Shorter analysis periods may reduce recommendation accuracy, as we&apos;ll have less data to understand your spending patterns.
        </div>
      </div>
    </div>
  );
};
