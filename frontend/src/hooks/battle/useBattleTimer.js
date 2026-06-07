import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { tickTimer } from '../../features/index';

export const useBattleTimer = (status, showCountdown) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (status !== 'active' || showCountdown) return;

    const timerInterval = setInterval(() => {
      dispatch(tickTimer());
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [status, showCountdown, dispatch]);
};
