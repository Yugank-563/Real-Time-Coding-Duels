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
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const toast = useToast();

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await api.get('/api/invitations/unread');
      if (data.success) {
        setInvitations(data.invites);
        setUnreadCount(data.invites.length);
      }
    } catch (err) {
      console.error('Failed to fetch unread invitations:', err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('bc-token');
    if (!token || token === 'undefined' || token === 'null') return;

    fetchUnread();

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
      setUnreadCount(prev => prev + 1);
      toast.info('New Battle Invitation! ⚔️', `You received an invitation from ${invite.sender.username}`);
    });

    socket.on('battle:invite:accepted', (data) => {
      const { invitation, room } = data;
      // If we are the sender, we get notified
      toast.success('Invitation Accepted! 🎉', `${invitation.recipient?.username || 'Opponent'} accepted your invite.`);
      
      // Navigate to room
      setTimeout(() => {
        window.location.href = `/battle/private/${room.roomId}/lobby`;
      }, 1000);
    });

    socket.on('battle:invite:declined', (invitation) => {
      toast.error('Invitation Declined', `${invitation.recipient?.username || 'Opponent'} declined your invite.`);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [fetchUnread]);

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.patch('/api/invitations/read');
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark invitations as read:', err);
    }
  };

  const acceptInvite = async (inviteId) => {
    try {
      const { data } = await api.post(`/api/invitations/${inviteId}/accept`);
      if (data.success) {
        setInvitations(prev => prev.map(inv => inv._id === inviteId ? { ...inv, status: 'accepted' } : inv));
        setUnreadCount(prev => Math.max(0, prev - 1));
        window.location.href = `/battle/private/${data.room.roomId}/lobby`;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Accept Failed', msg);
      if (msg.includes('expired')) {
        setInvitations(prev => prev.map(inv => inv._id === inviteId ? { ...inv, status: 'expired' } : inv));
      }
    }
  };

  const declineInvite = async (inviteId) => {
    try {
      const { data } = await api.post(`/api/invitations/${inviteId}/decline`);
      if (data.success) {
        setInvitations(prev => prev.map(inv => inv._id === inviteId ? { ...inv, status: 'declined' } : inv));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Decline Failed', msg);
      if (msg.includes('expired')) {
        setInvitations(prev => prev.map(inv => inv._id === inviteId ? { ...inv, status: 'expired' } : inv));
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
    unreadCount,
    markAsRead,
    acceptInvite,
    declineInvite,
    sendInvite
  };
};
