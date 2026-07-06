import { useInvitations, useDocumentTitle } from '../../hooks/index';
import { AnimationState, InvitationCard, PageLoader } from '../../components/index';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const InvitationHistory = () => {
  const { invitations, acceptInvite, declineInvite, isLoading } = useInvitations();
  useDocumentTitle('Invitations');

  return (
    <div className="w-full relative min-h-[400px]">
      <PageLoader isLoading={isLoading} message="Loading Invitations..." variant="dual-ring" />

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
                <div className="icon-box">
                  <UserPlus size={20} color="var(--accent-primary)" />
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
