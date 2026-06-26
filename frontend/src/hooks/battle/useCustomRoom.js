import { useState } from 'react';
import { api } from '../../utils/index';
import { useToast } from '../useToast';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/index';

export const useCustomRoom = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const myUser = useSelector(selectUser);

  const [roomName, setRoomName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [roomDifficulty, setRoomDifficulty] = useState('Medium');
  const [roomTimeLimit, setRoomTimeLimit] = useState(1200);
  const [isSpawningRoom, setIsSpawningRoom] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinRoomPassword, setJoinRoomPassword] = useState('');
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [joinRoomError, setJoinRoomError] = useState('');

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!myUser) {
      navigate(`/login?redirect=/battle/lobby`);
      return;
    }
    if (!roomName.trim()) {
      toast.error('Required Field', 'Please enter a private room name.');
      return;
    }

    setIsSpawningRoom(true);
    try {
      const res = await api.post('/api/battles/private/create', {
        name: roomName.trim(),
        password: roomPassword,
        difficulty: roomDifficulty,
        timeLimit: roomTimeLimit
      });

      setGeneratedLink(res.data.shareLink);
      toast.success('Room Generated! 👥', `Private Custom Room "${roomName}" created successfully.`);

      setTimeout(() => {
        navigate(`/battle/private/${res.data.roomId}/lobby`);
      }, 1200);
    } catch (err) {
      toast.error('Failed to create room', err.response?.data?.message || 'Error occurred.');
    } finally {
      setIsSpawningRoom(false);
    }
  };

  const handleJoinPrivateRoom = async (e) => {
    if (e) e.preventDefault();
    if (!myUser) {
      navigate(`/login?redirect=/battle/lobby`);
      return;
    }
    if (!joinRoomCode.trim()) {
      setJoinRoomError('Please enter a room code');
      return;
    }
    setJoinRoomError('');
    setIsJoiningRoom(true);
    try {
      const res = await api.post('/api/battles/private/join', {
        roomCode: joinRoomCode.trim(),
        password: joinRoomPassword
      });
      toast.success('Joined Custom Lobby!', 'Entering wait room...');
      navigate(`/battle/private/${res.data.roomId}/lobby`);
    } catch (err) {
      setJoinRoomError(err.response?.data?.message || 'Invalid code or incorrect password.');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  return {
    createRoom: {
      roomName, setRoomName,
      roomPassword, setRoomPassword,
      roomDifficulty, setRoomDifficulty,
      roomTimeLimit, setRoomTimeLimit,
      isSpawningRoom,
      generatedLink,
      handleCreateRoom
    },
    joinRoom: {
      joinRoomCode, setJoinRoomCode,
      joinRoomPassword, setJoinRoomPassword,
      isJoiningRoom,
      joinRoomError, setJoinRoomError,
      handleJoinPrivateRoom
    }
  };
};
