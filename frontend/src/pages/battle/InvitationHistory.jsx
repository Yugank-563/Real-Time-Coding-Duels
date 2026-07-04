import { useTheme, useInvitations, useDocumentTitle } from '../../hooks/index';
import { AnimationState, InvitationCard, PageLoader } from '../../components/index';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const InvitationHistory = () => {
  const { isDark, theme } = useTheme();
  const { invitations, acceptInvite, declineInvite, isLoading } = useInvitations();
  useDocumentTitle('Invitations');

  return (
    <div className="w-full relative min-h-[400px]" data-auth-theme={theme}>
      <PageLoader isLoading={isLoading} isDark={isDark} message="Loading Invitations..." variant="dual-ring" />

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'var(--auth-card)', border: '1px solid var(--auth-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <UserPlus size={20} color="var(--auth-accent)" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Battle Invitations</h1>
              </div>
              <p className="text-text-secondary text-sm">Manage your incoming battle requests.</p>
            </div>
          </div>

          {invitations.length === 0 ? (
            <div className="py-12">
              <AnimationState
                variant="empty"
                title="No Invitations Found"
                description="You don't have any incoming battle requests at the moment."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invitations.map(inv => (
                  <InvitationCard
                    key={inv._id}
                    invitation={inv}
                    isDark={isDark}
                    onAccept={(id) => acceptInvite(id)}
                    onDecline={(id) => declineInvite(id)}
                  />
                ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default InvitationHistory;
