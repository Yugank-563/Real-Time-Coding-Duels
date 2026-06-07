/**
 * Best-effort heuristic analyzer to estimate Time and Space Complexity
 * of submitted competitive programming code using static regex patterns.
 */

export const estimateComplexity = (code) => {
  if (!code || typeof code !== 'string') {
    return { time: 'O(1)', space: 'O(1)' };
  }

  // Remove comments (single-line and multi-line) to avoid false positives
  let cleanCode = code
    .replace(/\/\*[\s\S]*?\*\//g, '') // multi-line comments
    .replace(/\/\/.*/g, '')           // single-line comments
    .replace(/#.*/g, '');             // python comments

  // Time Complexity Heuristics
  let time = 'O(N)'; // Default fallback

  // 1. O(1) Checks (No loops, no recursion)
  const hasLoop = /for\s*\(|while\s*\(|do\s*\{|for\s+[a-zA-Z_]\w*\s+in\s+/.test(cleanCode);
  const hasRecursion = checkRecursion(cleanCode);
  
  if (!hasLoop && !hasRecursion) {
    time = 'O(1)';
  } else {
    // 2. Count max nested loops
    const maxNesting = countMaxNestedLoops(cleanCode);
    
    if (maxNesting >= 3) {
      time = 'O(N^3)';
    } else if (maxNesting === 2) {
      time = 'O(N^2)';
    } else {
      // Depth is 1
      // Check for O(log N) patterns
      const isLogN = /mid\s*=\s*|left\s*=\s*mid|right\s*=\s*mid|mid\s*[+-]\s*1/.test(cleanCode);
      // Check for O(N log N)
      const isNLogN = /\.sort\(|qsort\(|sort\s*\(|Arrays\.sort/.test(cleanCode);

      if (isNLogN) {
        time = 'O(N log N)';
      } else if (isLogN && !hasRecursion) {
        time = 'O(log N)';
      } else {
        time = 'O(N)';
      }
    }
  }

  // Check for exponential/recursive patterns without memoization
  if (hasRecursion && /return\s+.*\(.*\)\s*\+\s*.*\(.*\)/.test(cleanCode)) {
    time = 'O(2^N)'; // Simple fibonacci-like recursion
  }

  // Space Complexity Heuristics
  let space = 'O(1)'; // Default assumption

  // Check for dynamic array/map/set allocations, avoiding function parameters or array access
  const hasArrays = /=\s*\[\]|=\s*new\s+Array|new\s+(?:int|float|double|char|long|boolean)\s*\[|\bvector\s*<[\w\s,]+>\s+\w+\s*(?:=|\(|;|\{)|\bmap\s*<|\bset\s*<|\bunordered_map|\bunordered_set|=\s*\{\s*\}/.test(cleanCode);
  const hasDynamicAllocation = /malloc|calloc|new\s+[A-Z]/.test(cleanCode);
  
  // 2D Array check
  const has2DArray = /\[\]\[\]|vector\s*<\s*vector|new\s+int\[.*\]\[.*\]|=\s*\[\s*\[/.test(cleanCode);

  if (has2DArray) {
    space = 'O(N^2)';
  } else if (hasArrays || hasDynamicAllocation || hasRecursion) {
    // Recursion uses stack space
    space = 'O(N)';
  }

  return { time, space };
};

// Helper to count max loop nesting depth
const countMaxNestedLoops = (code) => {
  // A simple block depth counter for { }
  // We identify loops and see their depth
  const tokens = code.split(/({|}|for\s*\(|while\s*\(|for\s+[a-zA-Z_]\w*\s+in\s+)/).filter(Boolean);
  
  let currentDepth = 0;
  let maxLoopDepth = 0;
  let inLoopStack = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim();
    if (/^for\s*\(|^while\s*\(|^for\s+[a-zA-Z_]\w*\s+in\s+/.test(token)) {
      inLoopStack.push(currentDepth);
    } else if (token === '{') {
      currentDepth++;
    } else if (token === '}') {
      currentDepth--;
      // pop any loops that were at this depth
      while (inLoopStack.length > 0 && inLoopStack[inLoopStack.length - 1] >= currentDepth) {
        const depthDiff = inLoopStack.length; // number of currently active nested loops
        if (depthDiff > maxLoopDepth) {
          maxLoopDepth = depthDiff;
        }
        inLoopStack.pop();
      }
    }
  }
  
  // If formatting doesn't use braces properly, fallback to regex counting 'for'
  if (maxLoopDepth === 0) {
     const forCount = (code.match(/for\s*\(/g) || []).length;
     if (forCount >= 3) return 3;
     if (forCount === 2) return 2;
     if (forCount === 1) return 1;
  }
  
  return maxLoopDepth;
};

// Very basic heuristic to check if a function calls itself
const checkRecursion = (code) => {
  // Finds function declarations like: function foo() { ... foo() ... }
  // or: type foo(...) { ... foo(...) ... }
  // This is highly heuristic.
  const fnMatch = code.match(/(?:function|int|void|string|bool|long|float|double)\s+([a-zA-Z_]\w*)\s*\(/);
  if (fnMatch) {
    const fnName = fnMatch[1];
    // Check if fnName is called inside the code
    const regex = new RegExp(`\\b${fnName}\\s*\\(`, 'g');
    const matches = code.match(regex);
    // If it appears more than once (declaration + call)
    if (matches && matches.length > 1) {
      return true;
    }
  }
  return false;
};
