const health = {
  leetcode:    { up: true, failedAt: null },
};

export function markDown(source) {
  if (health[source]) {
    health[source].up = false;
    health[source].failedAt = Date.now();
  }
}

export function isUp(source) {
  if (!health[source]) return true;
  if (health[source].up) return true;
  const twoMin = 2 * 60 * 1000;
  if (Date.now() - health[source].failedAt > twoMin) {
    health[source].up = true; // Auto-recover after 2 minutes
    return true;
  }
  return false;
}

export default {
  markDown,
  isUp,
};
