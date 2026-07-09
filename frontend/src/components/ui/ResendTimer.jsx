import { useState, useEffect } from 'react';

// ResendTimer — shows a 90-second countdown, then a "Resend code" link.
// Used on VerifyOTP and ForgotPassword (OTP step).
const ResendTimer = ({ onResend }) => {
  const [seconds, setSeconds] = useState(() => {
    const saved = localStorage.getItem('otpResendTimestamp');
    if (saved) {
      const elapsed = Math.floor((Date.now() - parseInt(saved, 10)) / 1000);
      if (elapsed < 90) {
        return 90 - elapsed;
      }
    }
    // If no valid saved time exists, or 90s have already passed, the timer is done.
    return 0;
  });

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
            onClick={async () => { 
              const success = await onResend(); 
              if (success !== false) {
                localStorage.setItem('otpResendTimestamp', Date.now().toString());
                setSeconds(90); 
              }
            }}
          >
            Resend code
          </button>
        </>
      )}
    </p>
  );
};

export default ResendTimer;
