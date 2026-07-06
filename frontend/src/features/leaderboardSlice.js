import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../utils/index';

export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetchLeaderboard',
  async (
    { page = 1, limit = 20, search = '', sort = 'rating', order = 'desc', country = '' } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/api/users/leaderboard', {
        params: { page, limit, search, sort, order, country },
        timeout: 12000,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to load leaderboard'
      );
    }
  }
);

const initialState = {
  users:    [],
  total:      0,
  page:       1,
  totalPages: 0,
  hasNext:    false,
  hasPrev:    false,
  loading:    false,
  error:      null,
  countries:  [],   // populated from API response
  currentUserLeaderboard: null,
};

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error   = null;
        state.users = [];
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading    = false;
        state.users    = action.payload.users    ?? [];
        state.total      = action.payload.total      ?? 0;
        state.page       = action.payload.page       ?? 1;
        state.totalPages = action.payload.totalPages ?? 0;
        state.hasNext    = action.payload.hasNext    ?? false;
        state.hasPrev    = action.payload.hasPrev    ?? false;
        // Preserve countries across pages so the dropdown stays populated
        if (action.payload.countries?.length) {
          state.countries = action.payload.countries;
        }
        state.currentUserLeaderboard = action.payload.currentUser ?? null;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        state.users = [];
      });
  },
});

export const {} = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
