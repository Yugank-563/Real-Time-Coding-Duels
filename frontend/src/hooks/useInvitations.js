import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../utils/index';
import { useToast } from './useToast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:5001'
    : `http://${window.location.hostname}:5001`);

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

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected for invitations');
    });

    socket.on('battle:invite:new', (invite) => {
      setInvitations(prev => [invite, ...prev]);
      toast.info('New Battle Invitation! ⚔️', `You received an invitation from ${invite.sender.username}`);
    });

    socket.on('battle:invite:accepted', (data) => {
      const { invitation, room } = data;
      toast.success('Invitation Accepted! 🎉', `${invitation.recipient?.username || 'Opponent'} accepted your invite.`);
      
      setTimeout(() => {
        window.location.href = `/battle/private/${room.roomId}/lobby`;
      }, 1000);
    });

    socket.on('battle:invite:declined', (invitation) => {
      toast.error('Invitation Declined', `${invitation.recipient?.username || 'Opponent'} declined your invite.`);
    });
    
    socket.on('battle:invite:cancelled', ({ inviteId }) => {
      setInvitations(prev => prev.filter(inv => inv._id !== inviteId));
      toast.info('Invitation Cancelled', `An invitation was cancelled by the sender.`);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [fetchActive]);

  const acceptInvite = async (inviteId) => {
    try {
      const { data } = await api.post(`/api/invitations/${inviteId}/accept`);
      if (data.success) {
        setInvitations(prev => prev.filter(inv => inv._id !== inviteId));
        window.location.href = `/battle/private/${data.room.roomId}/lobby`;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Accept Failed', msg);
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
      toast.error('Decline Failed', msg);
      if (msg.includes('expired')) {
        setInvitations(prev => prev.filter(inv => inv._id !== inviteId));
      }
    }
  };

  const sendInvite = async (recipientId, battleMode = '1v1', metadata = {}) => {
    try {
      const { data } = await api.post('/api/invitations', { recipientId, battleMode, metadata });
      if (data.success) {
        toast.success('Invitation Sent', 'Waiting for opponent to accept...');
        return data.invite;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Failed to send invite', msg);
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
