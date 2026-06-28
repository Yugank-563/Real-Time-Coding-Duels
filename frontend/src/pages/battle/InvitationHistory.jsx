import { useState, useEffect } from 'react';
import { useTheme, useInvitations } from '../../hooks/index';
import { api } from '../../utils/index';
import { Pagination, AnimationState, InvitationCard, InvitationLoading } from '../../components/index';
import { UserPlus } from 'lucide-react';

const InvitationHistory = () => {
  const { isDark, theme } = useTheme();
  const { acceptInvite, declineInvite } = useInvitations();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const fetchHistory = async (pageNumber) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/invitations/history?page=${pageNumber}&limit=10`);
      if (data.success) {
        setInvitations(data.invitations);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchHistory(newPage);
    }
  };

  return (
    <div className="w-full" data-auth-theme={theme}>
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

      {loading ? (
        <InvitationLoading isDark={isDark} />
      ) : invitations.length === 0 ? (
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
                variant="list"
                isDark={isDark}
                onAccept={async (id) => {
                  await acceptInvite(id);
                  fetchHistory(page);
                }}
                onDecline={async (id) => {
                  await declineInvite(id);
                  fetchHistory(page);
                }}
              />
            ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        pagination={{ page, pages: totalPages, total }}
        setPage={handlePageChange}
        label="invitations"
      />
    </div>
  );
};

export default InvitationHistory;
