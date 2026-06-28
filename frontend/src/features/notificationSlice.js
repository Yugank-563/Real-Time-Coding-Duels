import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    toasts: [],
  },
  reducers: {
    addToast: (state, { payload }) => {
      state.toasts.push({
        id: Date.now() + Math.random(),
        type: payload.type || 'info', // 'success' | 'error' | 'warning' | 'info' | 'battle'
        title: payload.title,
        message: payload.message || '',
        duration: payload.duration || 4000,
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
