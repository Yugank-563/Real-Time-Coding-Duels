import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import themeReducer from '../features/themeSlice';
import notificationReducer from '../features/notificationSlice';
import battleReducer from '../features/battleSlice';
import problemsReducer from '../features/problemsSlice';

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    theme:         themeReducer,
    notifications: notificationReducer,
    battle:        battleReducer,
    problems:      problemsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in toast ids (Date.now + Math.random)
        ignoredPaths: ['notifications.toasts'],
      },
    }),
});
