import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  battleId: null,
  battleType: 'random-duel',
  mode: 'ranked',
  status: 'waiting', // 'waiting' | 'active' | 'ended'
  problem: null, // { id, title, difficulty, description, examples, constraints, boilerplates }
  players: [], // [{ user, score, status, progress, language }]
  opponent: null, // { id, username, elo, status, progress, language }
  opponents: [],
  topic: '',
  timer: {
    total: 0,
    remaining: 0,
    startTime: null,   // ISO string from server — source of truth for both users
    timeLimit: 0,   // seconds
    isWarning: false,
    isDanger: false,
  },
  output: {
    state: 'idle', // 'idle' | 'running' | 'success' | 'error'
    results: [],
    errorMessage: '',
    verdict: null,
    executionTime: 0,
    memory: 0,
    testCasesPassed: 0,
    totalTestCases: 0,
    runProgress: { done: 0, total: 0 }, // live batch progress
  },
  spectators: {
    count: 0,
    list: [],
  },
  lobbyStatus: 'idle', // 'idle' | 'queuing' | 'matched'
  invitedUser: null,
  eloDetails: null,
  winnerId: null,
};

const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    setLobbyStatus: (state, action) => {
      if (action.payload && typeof action.payload === 'object') {
        state.lobbyStatus = action.payload.status;
        if (action.payload.battleId) {
          state.battleId = action.payload.battleId;
        }
      } else {
        state.lobbyStatus = action.payload;
      }
    },
    setInvitedUser: (state, action) => {
      state.invitedUser = action.payload;
    },

    initBattle: (state, action) => {
      const { battleId, battleType, problem, players, myUserId, mode } = action.payload;
      state.battleId = battleId;
      state.battleType = battleType;
      state.mode = mode || 'ranked';
      state.problem = problem;
      state.players = players;
      state.status = 'active';
      const _tl = action.payload.timeLimit || problem?.timeLimit || 1200;
      state.timer.total = _tl;
      state.timer.timeLimit = _tl;
      state.timer.startTime = action.payload.startTime || null;
      state.timer.remaining = _tl;
      state.timer.isWarning = false;
      state.timer.isDanger = false;
      state.lobbyStatus = 'matched';
      state.output = initialState.output;
      state.eloDetails = null;

      const opponentPlayer = players.find(p => p.user._id !== myUserId);
      if (opponentPlayer) {
        state.opponent = {
          id: opponentPlayer.user._id,
          username: opponentPlayer.user.name || opponentPlayer.user.email.split('@')[0],
          elo: opponentPlayer.user.rating || 1200,
          status: opponentPlayer.status,
          progress: opponentPlayer.progress,
          language: opponentPlayer.language,
        };
      }

      state.opponents = action.payload.opponents ? action.payload.opponents.map(opp => ({
        id: opp.user._id,
        username: opp.user.name || opp.user.email.split('@')[0],
        elo: opp.user.rating || 1200,
        status: opp.status,
        progress: opp.progress,
        language: opp.language,
      })) : [];

      state.topic = action.payload.topic || '';
    },

    // Used on page refresh — resume from server startTime instead of resetting timer
    resumeBattle: (state, action) => {
      const { battleId, battleType, problem, players, myUserId, startTime, timeLimit, topic, mode } = action.payload;
      state.battleId = battleId;
      state.battleType = battleType;
      state.mode = mode || 'ranked';
      state.problem = problem;
      state.players = players;
      state.status = 'active';
      state.lobbyStatus = 'matched';
      state.output = initialState.output;
      state.eloDetails = null;
      state.topic = topic || '';

      // Store server startTime and timeLimit — useBattleTimer reads these every second
      const totalSeconds = timeLimit || 1200;
      state.timer.total = totalSeconds;
      state.timer.timeLimit = totalSeconds;
      state.timer.startTime = startTime || null;
      if (startTime) {
        const elapsedSeconds = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
        state.timer.remaining = Math.max(0, totalSeconds - elapsedSeconds);
      } else {
        state.timer.remaining = totalSeconds;
      }
      state.timer.isWarning = state.timer.remaining <= 60 && state.timer.remaining > 30;
      state.timer.isDanger = state.timer.remaining <= 30;

      const opponentPlayer = players.find(p => p.user._id !== myUserId);
      if (opponentPlayer) {
        state.opponent = {
          id: opponentPlayer.user._id,
          username: opponentPlayer.user.name || opponentPlayer.user.email.split('@')[0],
          elo: opponentPlayer.user.rating || 1200,
          status: opponentPlayer.status,
          progress: opponentPlayer.progress,
          language: opponentPlayer.language,
        };
      }

      state.opponents = action.payload.opponents ? action.payload.opponents.map(opp => ({
        id: opp.user._id,
        username: opp.user.name || opp.user.email.split('@')[0],
        elo: opp.user.rating || 1200,
        status: opp.status,
        progress: opp.progress,
        language: opp.language,
      })) : [];
    },

    // Server-authoritative tick: called every second with the value computed
    // from battle.startTime so both users always see identical time.
    setTimerRemaining: (state, action) => {
      const remaining = action.payload;
      state.timer.remaining = remaining;
      state.timer.isWarning = remaining <= 60 && remaining > 30;
      state.timer.isDanger = remaining <= 30;
    },
    setTimerStart: (state, action) => {
      state.timer.startTime = action.payload;
    },
    // Legacy — kept so old imports don't break, but no longer dispatched
    tickTimer: (state) => {
      if (state.timer.remaining > 0) {
        state.timer.remaining -= 1;
        state.timer.isWarning = state.timer.remaining <= 60 && state.timer.remaining > 30;
        state.timer.isDanger = state.timer.remaining <= 30;
      }
    },
    setOutputState: (state, action) => {
      state.output.state = action.payload;
      if (action.payload === 'running') {
        state.output.runProgress = { done: 0, total: 0 };
      }
    },
    setOutputProgress: (state, action) => {
      const { done, total } = action.payload;
      state.output.runProgress = { done, total };
    },
    setOutputResults: (state, action) => {
      const { results, errorMessage, verdict, executionTime, memory, testCasesPassed, totalTestCases, isSubmit, runProgress } = action.payload;
      state.output.results = results || [];
      state.output.errorMessage = errorMessage || '';
      state.output.verdict = verdict || null;
      state.output.executionTime = executionTime || 0;
      state.output.memory = memory || 0;
      state.output.testCasesPassed = testCasesPassed || 0;
      state.output.totalTestCases = totalTestCases || 0;
      state.output.state = verdict ? (verdict === 'AC' ? 'success' : 'error') : state.output.state;
      
      if (runProgress) {
         state.output.runProgress = runProgress;
      } else {
         state.output.runProgress = { 
            done: testCasesPassed || 0, 
            total: totalTestCases || 0, 
            isSubmit: isSubmit || false 
         };
      }
    },
    setEloDetails: (state, action) => {
      state.eloDetails = action.payload;
    },
    endBattle: (state, action) => {
      const { winnerId, ratingDetails, reason } = action.payload;
      state.status = 'ended';
      if (ratingDetails !== undefined) {
        state.eloDetails = ratingDetails;
      }
      state.winnerId = winnerId || null; // null = draw
      state.reason = reason;
    },

    resetBattleState: () => initialState,
  },
});

export const {
  setLobbyStatus,
  initBattle,
  resumeBattle,
  tickTimer,
  setTimerRemaining,
  setTimerStart,
  setOutputState,
  setOutputProgress,
  setOutputResults,
  setEloDetails,
  endBattle,
  resetBattleState,
} = battleSlice.actions;

export const selectBattle = (state) => state.battle;
export default battleSlice.reducer;
