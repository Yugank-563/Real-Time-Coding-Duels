import {  useState  } from 'react';
import { X } from 'lucide-react';
import AuthInput from '../ui/AuthInput';

const EditProfileModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [username, setUsername] = useState(initialData.username || '');
  const [name,     setName]     = useState(initialData.name     || '');
  const [bio,      setBio]      = useState(initialData.bio      || '');
  const [country,  setCountry]  = useState(initialData.country  || '');

  if (!isOpen) return null;

  const handleSaveClick = async () => {
    const hasChanges =
      username !== (initialData.username || '') ||
      name !== (initialData.name || '') ||
      bio !== (initialData.bio || '') ||
      country !== (initialData.country || '');

    if (!hasChanges) {
      onClose();
      return;
    }

    const res = await onSave({ username, name, bio, country });
    if (res?.success) {
      onClose();
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)',
                  backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', zIndex: 1000 }}>
      <div className="auth-card"
           style={{ width: '95%', maxWidth: 500, maxHeight: '88vh',
                    display: 'flex', flexDirection: 'column',
                    padding: '1.25rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingBottom: '0.75rem', borderBottom: '1px solid var(--auth-card-border)',
                      marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700,
                       color: 'var(--auth-heading)' }}>Edit Profile</h3>
          <button type="button" onClick={onClose}
                  style={{ background: 'none', border: 'none', cursor: 'pointer',
                           color: 'var(--auth-muted)', padding: 0, display: 'flex' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex',
                      flexDirection: 'column', gap: '0.75rem' }}>
          <AuthInput label="Username" value={username}
                     onChange={e => setUsername(e.target.value)} placeholder="Enter username" />
          <AuthInput label="Name" value={name}
                     onChange={e => setName(e.target.value)} placeholder="Enter your name" />
          <div className="auth-input-wrapper">
            <label className="auth-label">Bio / About Me</label>
            <textarea className="auth-input" rows={3}
                      style={{ minHeight: 80, resize: 'vertical', paddingTop: '0.5rem',
                              fontFamily: 'inherit', fontSize: '0.83rem' }}
                      value={bio} onChange={e => setBio(e.target.value)}
                      placeholder="Tell us about yourself…" maxLength={250} />
            <div style={{ fontSize: '0.65rem', color: 'var(--auth-muted)',
                          textAlign: 'right', marginTop: 2 }}>
              {bio.length}/250
            </div>
          </div>
          <AuthInput label="Country" value={country}
                     onChange={e => setCountry(e.target.value)} placeholder="e.g. India, USA" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem',
                      paddingTop: '0.75rem', borderTop: '1px solid var(--auth-card-border)',
                      marginTop: '0.75rem' }}>
          <button type="button" onClick={onClose} className="auth-btn-primary"
                  style={{ background: 'none', border: '1px solid var(--auth-card-border)',
                           color: 'var(--auth-heading)', boxShadow: 'none',
                           width: 'auto', padding: '0.45rem 1rem', fontSize: '0.8rem',
                           maxWidth: '120px' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSaveClick}
                  className="auth-btn-primary"
                  style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.8rem',
                           maxWidth: '150px' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
