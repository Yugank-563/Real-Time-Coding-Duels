import { configureStore } from '@reduxjs/toolkit';
import { 
  authReducer, 
  themeReducer, 
  notificationReducer, 
  battleReducer, 
  problemsReducer 
} from '../features/index';

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
