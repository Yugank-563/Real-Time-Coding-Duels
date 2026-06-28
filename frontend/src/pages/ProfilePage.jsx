import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Globe, Calendar, User as UserIcon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useProfile } from '../hooks/useProfile';
import { useDocumentTitle } from '../hooks/index';
import RatingChart from '../components/profile/RatingChart';
import DifficultyRing from '../components/profile/DifficultyRing';
import EditProfileModal from '../components/profile/EditProfileModal';

const ProfilePage = () => {
  const { username } = useParams();
  useDocumentTitle(`${username}'s Profile`);
  const { theme } = useTheme();
  const { profile, loading, isOwn, handleSave } = useProfile(username);
  const [editOpen, setEditOpen] = useState(false);

  const renderBio = (text) => {
    if (!text) return null;
    const re = /(https?:\/\/[^\s]+)/g;
    return text.split(re).map((part, i) =>
      /^https?:\/\//.test(part)
        ? <a key={i} href={part} target="_blank" rel="noopener noreferrer"
             style={{ color: 'var(--auth-btn)', textDecoration: 'underline' }}
             onClick={e => e.stopPropagation()}>{part}</a>
        : part
    );
  };

  if (loading) return (
    <div className="auth-page-bg" data-auth-theme={theme || 'dark'}>
      <div className="auth-spinner" style={{ width: 20, height: 20 }} />
    </div>
  );

  if (!profile) return (
    <div className="auth-page-bg" data-auth-theme={theme || 'dark'}>
      <div className="auth-card" style={{ maxWidth: 320, textAlign: 'center', margin: 'auto' }}>
        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.65rem' }}>👤</span>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--auth-heading)', margin: 0 }}>
          User Not Found
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--auth-muted)', margin: '0.3rem 0 0' }}>
          @{username} doesn't exist on BattleCode.
        </p>
      </div>
    </div>
  );

  const { user, battleStats, submissionStats, difficulties, ratingHistory } = profile;

  /* card style shorthand */
  const card = {
    background: 'var(--auth-card)',
    border: '1px solid var(--auth-card-border)',
    borderRadius: '1rem',
    padding: '1.15rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
  };

  /* meta row item */
  const MetaRow = ({ icon: Icon, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
      <Icon size={13} style={{ color: 'var(--auth-muted)', flexShrink: 0 }} />
      <span style={{ fontSize: '0.78rem', color: 'var(--auth-heading)' }}>{text}</span>
    </div>
  );

  return (
    <div className="auth-page-bg" data-auth-theme={theme || 'dark'}
         style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', overflow: 'visible', minHeight: 'auto' }}>

      {/* ── Page container ── */}
      <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto',
                    boxSizing: 'border-box' }}>
                    
        {/* Header */}
        <div style={{ marginBottom: '1rem', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'var(--auth-card)', border: '1px solid var(--auth-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <UserIcon size={20} color="var(--auth-accent)" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--auth-heading)', letterSpacing: '-0.02em' }}>
              {isOwn ? 'My Profile' : 'Profile'}
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--auth-muted)', margin: 0 }}>
            {isOwn ? 'Manage your personal information and track your statistics.' : `View ${user.username}'s statistics and battle history.`}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', alignItems: 'center' }}>

          {/* ── CARD 1: PERSONAL PROFILE ── */}
          <div className="auth-card" style={card}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              {/* Header profile info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700,
                               color: 'var(--auth-heading)', letterSpacing: '-0.01em',
                               lineHeight: 1.2 }}>
                    {user.name || user.username}
                  </h1>
                  <span style={{ fontSize: '0.78rem', color: 'var(--auth-muted)', fontWeight: 500 }}>
                    @{user.username}
                  </span>
                </div>

                {isOwn && (
                  <button type="button" onClick={() => setEditOpen(true)}
                          className="auth-btn-primary"
                          style={{ background: 'transparent',
                                   border: '1px solid var(--auth-btn)',
                                   color: 'var(--auth-btn)', boxShadow: 'none',
                                   padding: '0.4rem 1rem', fontSize: '0.78rem',
                                   width: 'auto', letterSpacing: '0.02em', alignSelf: 'flex-start',
                                   maxWidth: '140px' }}>
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--auth-muted)',
                            lineHeight: 1.55, wordBreak: 'break-word' }}>
                  {renderBio(user.bio)}
                </p>
              )}

              {/* Meta block */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--auth-card-border)' }}>
                {user.country && <MetaRow icon={Globe} text={user.country} />}
                <MetaRow icon={Calendar}
                         text={`Joined ${new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`} />
              </div>
            </div>
          </div>

          {/* ── CARD 2: BATTLE HISTORY ── */}
          <div className="auth-card" style={card}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <RatingChart
                data={ratingHistory}
                currentRating={user.rating}
                totalBattles={battleStats.totalBattles}
                winRate={battleStats.winRate}
              />
            </div>
          </div>

          {/* ── CARD 3: PROBLEMS STATISTICS ── */}
          <div className="auth-card" style={card}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <DifficultyRing
                difficulties={difficulties}
                totalSubmissions={submissionStats.totalSubmissions}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {isOwn && (
        <EditProfileModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          initialData={user}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ProfilePage;
