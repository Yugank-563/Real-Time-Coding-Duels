import React from 'react';

// Steps: Email (0) → Verify (1) → Reset (2)
const STEP_LABELS = ['Email', 'Verify', 'Reset'];

const StepIndicator = ({ current }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '1.4rem',
  }}>
    {STEP_LABELS.map((label, i) => {
      const isDone   = current > i;
      const isActive = current === i;
      return (
        <React.Fragment key={label}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{
              width: '1.85rem', height: '1.85rem', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 700, transition: 'all 0.3s',
              background: isDone ? '#22C55E' : isActive ? 'var(--btn-primary-bg)' : 'var(--bg-elevated)',
              color:      isDone ? '#fff'    : isActive ? 'var(--btn-primary-text)' : 'var(--text-muted)',
              border: `2px solid ${isDone ? '#22C55E' : isActive ? 'var(--btn-primary-bg)' : 'var(--border)'}`,
            }}>
              {isDone ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : i + 1}
            </div>
            <span style={{
              fontSize: '0.58rem',
              color:      isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: isActive ? 600 : 400,
            }}>
              {label}
            </span>
          </div>

          {i < STEP_LABELS.length - 1 && (
            <div style={{
              flex: 1, height: '2px',
              margin: '0 0.3rem', marginBottom: '1rem',
              background: isDone ? '#22C55E' : 'var(--border)',
              transition: 'background 0.3s', minWidth: '1.5rem',
            }}/>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export default StepIndicator;
