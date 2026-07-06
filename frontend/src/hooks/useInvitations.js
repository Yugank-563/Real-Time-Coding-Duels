import { useState, useEffect, useCallback, useRef } from 'react';
import { api, getSocket } from '../utils/index';
import { useToast } from './useToast';

export const useInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef(null);
  const toast = useToast();

  const fetchActive = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/api/invitations');
      if (data.success) {
        setInvitations(data.invitations || []);
      }
    } catch (err) {
      console.error('Failed to fetch active invitations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('bc-token');
    if (!token || token === 'undefined' || token === 'null') {
      setIsLoading(false);
      return;
    }

    fetchActive();

    const socket = getSocket();
    socketRef.current = socket;

    socket.on('battle:invite:new', (invite) => {
      // API now returns the populated invite directly
      const formattedInvite = {
        _id: invite._id,
        sender: invite.sender,
        battleMode: invite.battleMode,
        metadata: invite.metadata || {},
        expiresAt: invite.expiresAt,
      };
      setInvitations(prev => [formattedInvite, ...prev]);
      let msg = `You received an invitation from ${invite.sender.username} for a ${invite.battleMode === 'timed-sprint' ? 'Timed Sprint' : invite.battleMode === 'topic-duel' ? 'Topic Duel' : 'Random Duel'}.`;
      if (invite.metadata?.topic) {
        msg += ` Topic: ${invite.metadata.topic}.`;
      }
      if (invite.metadata?.difficulty) {
        msg += ` Difficulty: ${invite.metadata.difficulty}.`;
      }
      toast.info(msg);
    });

    socket.on('battle:invite:accepted', (data) => {
      const { room } = data;
      toast.success(`Entering the Private Lobby...`);
      
      setTimeout(() => {
        window.location.href = `/battle/private/${room._id || room.id}`;
      }, 1000);
    });

    socket.on('battle:invite:declined', (invite) => {
      toast.error(`${invite.recipient?.username || 'Opponent'} declined your invite.`);
    });

    return () => {
      if (socket) {
        socket.off('battle:invite:new');
        socket.off('battle:invite:accepted');
        socket.off('battle:invite:declined');
      }
    };
  }, [fetchActive]);

  const acceptInvite = async (inviteId) => {
    try {
      const { data } = await api.post(`/api/invitations/${inviteId}/accept`);
      if (data.success) {
        setInvitations(prev => prev.filter(inv => inv._id !== inviteId));
        window.location.href = `/battle/private/${data.room?._id || data.room?.id}`;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      if (msg.includes('expired')) {
        setInvitations(prev => prev.filter(inv => inv._id !== inviteId));
      }
    }
  };

  const declineInvite = async (inviteId) => {
    try {
      const { data } = await api.post(`/api/invitations/${inviteId}/decline`);
      if (data.success) {
        setInvitations(prev => prev.filter(inv => inv._id !== inviteId));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      if (msg.includes('expired')) {
        setInvitations(prev => prev.filter(inv => inv._id !== inviteId));
      }
    }
  };

  const sendInvite = async (toUsername, battleType = 'random-duel', options = {}) => {
    try {
      const { data } = await api.post('/api/invitations', { 
        recipientId: toUsername, 
        battleMode: battleType, 
        metadata: { topic: options.topic, difficulty: options.difficulty, timeLimit: options.timeLimit } 
      });
      if (data.success) {
        toast.success(`Waiting for ${toUsername} to accept...`);
        return data.invite;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      throw err;
    }
  };

  return {
    invitations,
    isLoading,
    acceptInvite,
    declineInvite,
    sendInvite
  };
};
