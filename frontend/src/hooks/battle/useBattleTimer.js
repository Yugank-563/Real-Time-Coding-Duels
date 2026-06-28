import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setTimerRemaining, tickTimer } from '../../features/index';

/**
 * Server-authoritative battle timer.
 *
 * PRIMARY MODE (startTime available):
 *   Each client aligns its interval to fire at whole-second boundaries
 *   relative to serverStart (serverStart + n*1000ms).
 *   Both users compute Math.floor at the same sub-second offset
 *   → always identical display, regardless of when they joined or refreshed.
 *
 * FALLBACK MODE (no startTime):
 *   Decrements remaining by 1/s (old behaviour).
 */
export const useBattleTimer = (status, showCountdown, startTime, timeLimit) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (status !== 'active' || showCountdown !== false) return;

    if (startTime) {
      const serverStart = new Date(startTime).getTime();
      const limit = timeLimit || 1200;

      const tick = () => {
        const elapsedSeconds = Math.floor((Date.now() - serverStart) / 1000);
        const remaining = Math.max(0, limit - elapsedSeconds);
        dispatch(setTimerRemaining(remaining));
      };

      // Show correct value immediately (no 1-second blank)
      tick();

      // Compute ms until the next whole-second boundary relative to serverStart.
      // e.g. if 3847ms have elapsed, next boundary is in 153ms.
      // Both clients do this identically → they fire at serverStart+4000, +5000, ...
      const msOffset = (Date.now() - serverStart) % 1000;
      const msUntilNextBoundary = 1000 - msOffset;

      let interval;
      const alignTimeout = setTimeout(() => {
        tick();
        interval = setInterval(tick, 1000);
      }, msUntilNextBoundary);

      return () => {
        clearTimeout(alignTimeout);
        clearInterval(interval);
      };
    } else {
      // ── FALLBACK: client decrement ──
      const interval = setInterval(() => dispatch(tickTimer()), 1000);
      return () => clearInterval(interval);
    }
  }, [status, showCountdown, startTime, timeLimit, dispatch]);
};
