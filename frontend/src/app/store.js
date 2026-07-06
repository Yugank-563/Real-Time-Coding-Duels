import { configureStore } from '@reduxjs/toolkit';
import { 
  authReducer, 
  notificationReducer, 
  battleReducer, 
  problemsReducer,
  leaderboardReducer
} from '../features/index';

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    notifications: notificationReducer,
    battle:        battleReducer,
    problems:      problemsReducer,
    leaderboard:   leaderboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in toast ids (Date.now + Math.random)
        ignoredPaths: ['notifications.toasts'],
      },
    }),
});
