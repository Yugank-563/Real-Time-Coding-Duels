import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import themeReducer from '../features/theme/themeSlice';
import notificationReducer from '../features/notification/notificationSlice';
import battleReducer from '../features/battle/battleSlice';

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    theme:         themeReducer,
    notifications: notificationReducer,
    battle:        battleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in toast ids (Date.now + Math.random)
        ignoredPaths: ['notifications.toasts'],
      },
    }),
});
