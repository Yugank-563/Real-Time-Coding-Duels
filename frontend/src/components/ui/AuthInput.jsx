import {  useState  } from 'react';

/**
 * AuthInput — shared form input for all auth pages.
 * Supports: label, password show/hide, error border (no inline text — errors go to toast).
 * headerRight: optional JSX rendered inline beside the label (e.g. "Forgot password?" link).
 */
const AuthInput = ({
  label, type = 'text', id, name, value, onChange,
  placeholder, required, error, autoComplete, headerRight,
}) => {
  const [show, setShow]   = useState(false);
  const isPassword        = type === 'password';
  const inputType         = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className="auth-input-wrapper">
      {(label || headerRight) && (
        <div className="auth-label-row">
          {label && (
            <label htmlFor={id || name} className="auth-label">{label}</label>
          )}
          {headerRight}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <input
          id={id || name} type={inputType} name={name}
          value={value} onChange={onChange} placeholder={placeholder}
          required={required} autoComplete={autoComplete}
          className={`auth-input${error ? ' auth-input--error' : ''}`}
          style={isPassword ? { paddingRight: '2.8rem' } : {}}
        />

        {isPassword && (
          <button
            type="button" tabIndex={-1}
            onClick={() => setShow(s => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute', right: '0.75rem', top: '50%',
              transform: 'translateY(-50%)', background: 'none', border: 'none',
              color: 'var(--auth-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', padding: 0, lineHeight: 1,
            }}
          >
            {show ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthInput;
