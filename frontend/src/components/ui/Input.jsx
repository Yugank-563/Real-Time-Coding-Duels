import {  useState  } from 'react';

//Input — shared form input for all pages.
//Supports: label, password show/hide, error border (no inline text — errors go to toast).
//headerRight: optional JSX rendered inline beside the label (e.g. "Forgot password?" link).

const Input = ({
  label, type = 'text', id, name, value, onChange,
  placeholder, required, error, autoComplete, headerRight,
  icon, className = ''
}) => {
  const [show, setShow]   = useState(false);
  const isPassword        = type === 'password';
  const inputType         = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className="input-wrapper">
      {(label || headerRight) && (
        <div className="form-label-row">
          {label && (
            <label htmlFor={id || name} className="form-label">{label}</label>
          )}
          {headerRight}
        </div>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id || name} type={inputType} name={name}
          value={value} onChange={onChange} placeholder={placeholder}
          required={required} autoComplete={autoComplete}
          className={`input ${error ? 'input--error' : ''} ${isPassword ? '!pr-11' : ''} ${icon ? '!pl-10' : ''} ${className}`}
        />

        {isPassword && (
          <button
            type="button" tabIndex={-1}
            onClick={() => setShow(s => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-[var(--text-muted)] cursor-pointer flex items-center p-0 leading-none hover:text-[var(--text-primary)] transition-colors"
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

export default Input;
