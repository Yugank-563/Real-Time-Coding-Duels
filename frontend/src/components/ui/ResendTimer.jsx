import { useState, useEffect } from 'react';

// ResendTimer — shows a 60-second countdown, then a "Resend code" link.
// Used on VerifyOTP and ForgotPassword (OTP step).
const ResendTimer = ({ onResend }) => {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
      {seconds > 0 ? (
        <>Resend code in <strong style={{ color: 'var(--text-primary)' }}>{seconds}s</strong></>
      ) : (
        <>
          Didn't receive it?{' '}
          <button
            type="button"
            className="link"
            style={{ fontSize: '0.75rem' }}
            onClick={() => { onResend(); setSeconds(60); }}
          >
            Resend code
          </button>
        </>
      )}
    </p>
  );
};

export default ResendTimer;
