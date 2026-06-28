import { useDispatch } from 'react-redux';
import { addToast } from '../features/index';

export const useToast = () => {
  const dispatch = useDispatch();

  return {
    success: (title, message, duration) =>
      dispatch(addToast({ type: 'success', title, message, duration })),
    error: (title, message, duration) =>
      dispatch(addToast({ type: 'error', title, message, duration })),
    warning: (title, message, duration) =>
      dispatch(addToast({ type: 'warning', title, message, duration })),
    info: (title, message, duration) =>
      dispatch(addToast({ type: 'info', title, message, duration })),
    battle: (title, message, duration) =>
      dispatch(addToast({ type: 'battle', title, message, duration })),
  };
};
