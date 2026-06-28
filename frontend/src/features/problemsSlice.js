import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../utils/index';

// Async thunk to fetch problems
export const fetchProblems = createAsyncThunk(
  'problems/fetchProblems',
  async ({ page = 1, limit = 20, search = '', difficulty = 'ALL', tag = 'ALL' }, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/problems', {
        params: { page, limit, search, difficulty, tag },
        timeout: 10000,
      });
      return response.data; // { problems: [], pagination: {} }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to load problems'
      );
    }
  }
);

const initialState = {
  items: [],
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    limit: 20,
  },
  loading: false,
  error: null,
};

const problemsSlice = createSlice({
  name: 'problems',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Do NOT clear items immediately on pending to allow smooth transitions,
        // or clear them if skeleton loaders are preferred. We'll clear them to show skeletons:
        state.items = [];
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.problems || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      });
  },
});

export const {} = problemsSlice.actions;

export default problemsSlice.reducer;
