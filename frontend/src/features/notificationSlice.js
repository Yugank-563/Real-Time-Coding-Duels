import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    toasts: [],
  },
  reducers: {
    addToast: (state, { payload }) => {
      // Prevent duplicate identical toasts from stacking up
      const isDuplicate = state.toasts.some(
        (t) => 
          t.message === (payload.message || '') && 
          t.type === (payload.type || 'info')
      );

      if (isDuplicate) return;

      state.toasts.push({
        id: Date.now() + Math.random(),
        type: payload.type || 'info',
        message: payload.message || '',
        duration: Math.min(payload.duration || 3000, 3000),
      });
    },
    removeToast: (state, { payload }) => {
      state.toasts = state.toasts.filter((t) => t.id !== payload);
    },
  },
});

export const { addToast, removeToast } = notificationSlice.actions;
export const selectToasts = (state) => state.notifications.toasts;
export default notificationSlice.reducer;
