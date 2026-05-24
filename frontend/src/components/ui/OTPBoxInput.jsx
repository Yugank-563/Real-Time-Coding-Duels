import { useRef, useEffect } from 'react';

// OTPBoxInput — 6 individual digit boxes for OTP entry.
// Features: auto-focus first box, arrow-key navigation, backspace, paste.
// Error state highlights all boxes with red border.
const OTPBoxInput = ({ value, onChange, error }) => {
  const refs = useRef([]);
  const digits = (value + '      ').slice(0, 6).split('');

  // Auto-focus first box on mount
  useEffect(() => { refs.current[0]?.focus(); }, []);

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      onChange(value.slice(0, i) + value.slice(i + 1));
      if (i > 0) refs.current[i - 1]?.focus();
      return;
    }
    if (e.key === 'ArrowLeft'  && i > 0) { refs.current[i - 1]?.focus(); return; }
    if (e.key === 'ArrowRight' && i < 5) { refs.current[i + 1]?.focus(); return; }
  };

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/[^0-9]/g, '').slice(-1);
    if (!char) return;
    const arr  = (value + '      ').slice(0, 6).split('');
    arr[i]     = char;
    onChange(arr.join('').replace(/ /g, '').slice(0, 6));
    if (i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i]?.trim() || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          aria-label={`OTP digit ${i + 1}`}
          id={`otp-digit-${i + 1}`}
          className={`auth-input${error ? ' auth-input--error' : ''}`}
          style={{
            width: '2.8rem', height: '3rem',
            textAlign: 'center', fontSize: '1.3rem',
            fontWeight: 700, fontFamily: 'monospace',
            padding: 0, letterSpacing: 0,
          }}
        />
      ))}
    </div>
  );
};

export default OTPBoxInput;
