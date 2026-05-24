// AuthButton — primary submit button for all auth forms.
// Shows a spinner + "Please wait…" while loading.
const AuthButton = ({
  children, loading, type = 'button', disabled, onClick,
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className="auth-btn-primary"
    onClick={onClick}
    id="auth-submit-btn"
  >
    {loading
      ? <><span className="auth-spinner" /><span>Please wait…</span></>
      : children}
  </button>
);

export default AuthButton;
