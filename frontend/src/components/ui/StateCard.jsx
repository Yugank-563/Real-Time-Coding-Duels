import '../../styles/auth.css';

const StateCard = ({ icon, title, message, isError }) => {
  return (
    <div
      className="auth-card"
      style={{
        maxWidth: '100%',
        padding: isError ? '2.5rem 2rem' : '4rem 2rem',
        textAlign: 'center',
      }}
    >
      {icon && <p style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{icon}</p>}
      
      {title && (
        <p style={{ 
          fontWeight: 700, 
          color: isError ? 'var(--auth-error)' : 'var(--auth-heading)', 
          marginBottom: '0.35rem' 
        }}>
          {title}
        </p>
      )}
      
      <p style={{ 
        fontSize: title ? '0.875rem' : '1rem', 
        color: isError && !title ? 'var(--auth-error)' : 'var(--auth-muted)',
        margin: 0
      }}>
        {message}
      </p>
    </div>
  );
};

export default StateCard;
