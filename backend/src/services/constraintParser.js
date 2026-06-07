/**
 * constraintParser.js
 *
 * Reads a LeetCode problem's HTML content and C++ boilerplate and produces a
 * structured object describing each parameter's type and valid value range.
 * Used by testCaseGeneratorService to produce valid, well-distributed inputs.
 */

// ── C++ type classifier ───────────────────────────────────────────────────────

function classifyCppType(typeStr) {
  const t = (typeStr || '').trim();
  if (/vector\s*<\s*vector\s*<\s*int/i.test(t))    return 'matrix';
  if (/vector\s*<\s*vector\s*<\s*string/i.test(t)) return 'stringMatrix';
  if (/vector\s*<\s*vector\s*<\s*char/i.test(t))   return 'charMatrix';
  if (/vector\s*<\s*int/i.test(t))                 return 'intArray';
  if (/vector\s*<\s*string/i.test(t))              return 'stringArray';
  if (/vector\s*<\s*char/i.test(t))                return 'charArray';
  if (/vector\s*<\s*long\s*long/i.test(t))         return 'longArray';
  if (/\bstring\b/i.test(t))                       return 'string';
  if (/\bbool\b/i.test(t))                         return 'bool';
  if (/long\s+long/i.test(t))                      return 'longlong';
  if (/\bint\b/i.test(t))                          return 'int';
  if (/\bchar\b/i.test(t))                         return 'char';
  if (/\bdouble\b|\bfloat\b/i.test(t))             return 'double';
  return 'int'; // safe default
}

// ── Parse C++ boilerplate → extract params list ───────────────────────────────

export function parseBoilerplate(cppCode) {
  if (!cppCode) return [];

  // Isolate the public section of class Solution
  let searchArea = cppCode;
  const pubIdx = cppCode.indexOf('public:');
  if (pubIdx !== -1) searchArea = cppCode.substring(pubIdx + 7);

  // Collect all method signatures (same logic as cpp.driver.js)
  const allMethods = [];
  const sigRegex = /([\w:<>*&\s,]+?)\s+([a-z]\w*)\s*\(([^)]*)\)\s*(?:const\s*)?\{/g;
  let m;
  while ((m = sigRegex.exec(searchArea)) !== null) {
    const name = m[2].trim();
    if (['if', 'for', 'while', 'switch', 'catch', 'do'].includes(name)) continue;
    allMethods.push({ returnType: m[1].trim(), name, paramsStr: m[3].trim() });
  }
  if (!allMethods.length) return [];

  // Pick the method with the richest return type (= solution method)
  function rtPriority(rt) {
    if (/vector\s*<\s*vector\s*<\s*vector/i.test(rt)) return 5;
    if (/vector\s*<\s*vector/i.test(rt))              return 4;
    if (/vector/i.test(rt))                           return 3;
    if (/string/i.test(rt))                           return 2;
    if (/int|long|double|bool|char/i.test(rt))        return 1;
    if (/void/i.test(rt))                             return 0;
    return 1;
  }
  const sorted = allMethods
    .map((meth, idx) => ({ ...meth, idx, p: rtPriority(meth.returnType) }))
    .sort((a, b) => b.p !== a.p ? b.p - a.p : a.idx - b.idx);
  const main = sorted[0];

  // Split paramsStr respecting template angle brackets
  const params = [];
  if (main.paramsStr) {
    let cur = '', depth = 0;
    for (const ch of main.paramsStr) {
      if (ch === '<') depth++;
      else if (ch === '>') depth--;
      if (ch === ',' && depth === 0) { params.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    if (cur.trim()) params.push(cur.trim());
  }

  return params.map(p => {
    // Strip reference/pointer qualifiers and extract the last word as name
    const nameMatch = p.match(/(\w+)\s*(?:=\s*\S+)?\s*$/);
    const name = nameMatch ? nameMatch[1] : 'x';
    // Everything before the name = type
    const rawType = p.replace(/(\w+)\s*(?:=\s*\S+)?\s*$/, '').replace(/[&*]/g, '').trim();
    return { name, cppType: classifyCppType(rawType), rawType };
  });
}

// ── Parse a constraint number like "10^9", "-10^4", "10000" ──────────────────

function parseNum(s) {
  if (!s) return NaN;
  const str = s.trim();
  const exp = str.match(/^(-?\d+)\^(\d+)$/);
  if (exp) return parseInt(exp[1]) ** parseInt(exp[2]);
  const n = parseFloat(str);
  return isNaN(n) ? NaN : n;
}

// ── Extract constraint text block from HTML ───────────────────────────────────

export function extractConstraintText(html) {
  if (!html) return '';
  // Strip HTML tags first — we look for "Constraints" then grab bullet list content
  const plain = html
    .replace(/<li>/gi, '\n')
    .replace(/<sup>(.*?)<\/sup>/gi, '^$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&le;/g, '≤')
    .replace(/&ge;/g, '≥')
    .replace(/&#160;/g, ' ');

  // Find the "Constraints" section
  const idx = plain.search(/\bConstraints?\b/i);
  if (idx !== -1) {
    return plain.substring(idx, idx + 2000);
  }
  return plain.slice(-2000); // fallback: last part of text
}

// ── Main: parseConstraints ────────────────────────────────────────────────────

/**
 * @param {string} constraintText  — raw text with constraint lines
 * @param {Array}  params          — output of parseBoilerplate()
 * @returns {{ params: ParsedParam[], flags: object }}
 */
export function parseConstraints(constraintText, params = []) {
  if (!params.length) return buildDefaultConstraints(params);

  const lines = (constraintText || '')
    .split('\n')
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  // Variable → bounds map
  const bounds = {}; // e.g. bounds['nums.length'] = { min:1, max:10^4 }

  for (const line of lines) {
    // Handle both <= and ≤
    const normalised = line.replace(/≤/g, '<=').replace(/≥/g, '>=');

    // Pattern: lo <= VAR <= hi   (most LeetCode constraints)
    const m = normalised.match(
      /^(-?[\d.]+\^?[\d]*)\s*<=\s*([\w.[\]]+)\s*<=\s*(-?[\d.]+\^?[\d]*)\s*$/
    );
    if (m) {
      const [, lo, varRaw, hi] = m;
      const varName = varRaw.trim();
      const minV = parseNum(lo);
      const maxV = parseNum(hi);
      if (!isNaN(minV) && !isNaN(maxV)) {
        bounds[varName] = { min: minV, max: maxV };
      }
      continue;
    }

    // Flags
    if (/sorted in (ascending|non-decreasing)/i.test(line)) bounds['__sorted__'] = true;
    if (/all .*?(distinct|unique)/i.test(line)) bounds['__unique__'] = true;
    let charset = bounds['__charset__'] || '';
    if (/lowercase (english )?letters?/i.test(line)) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (/uppercase (english )?letters?/i.test(line)) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (/english letters/i.test(line) && !/lowercase|uppercase/i.test(line)) charset += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (/digits/i.test(line)) charset += '0123456789';
    if (/spaces/i.test(line) || /' '/.test(line) || /&#39; &#39;/.test(line)) charset += ' ';
    if (/alphanumeric/i.test(line)) charset += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    if (/lowercase and uppercase/i.test(line)) charset += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    if (charset) {
      bounds['__charset__'] = Array.from(new Set(charset.split(''))).join('');
    }
  }

  const parsedParams = params.map(param => buildParamConstraint(param, bounds));

  return {
    params: parsedParams,
    flags: {
      sorted:  bounds['__sorted__']  || false,
      unique:  bounds['__unique__']  || false,
      charset: bounds['__charset__'] || 'abcdefghijklmnopqrstuvwxyz',
    },
  };
}

// ── Build per-param constraint from bounds map ────────────────────────────────

function buildParamConstraint(param, bounds) {
  const { name, cppType } = param;
  const pc = { name, cppType };

  switch (cppType) {
    case 'intArray':
    case 'longArray':
    case 'charArray': {
      const lenB = bounds[`${name}.length`] || bounds['n'] || {};
      const elemB = bounds[`${name}[i]`] || bounds[`${name}[j]`] || {};
      pc.minLen  = Math.max(1,   lenB.min  ?? 1);
      pc.maxLen  = Math.min(100000, lenB.max  ?? 20);
      pc.elemMin = elemB.min ?? -1000;
      pc.elemMax = elemB.max ??  1000;
      // Clamp huge element ranges for generation speed
      pc.elemMin = Math.max(-1e6, pc.elemMin);
      pc.elemMax = Math.min(1e6,  pc.elemMax);
      break;
    }
    case 'matrix':
    case 'charMatrix': {
      const rowB = bounds[`${name}.length`] || {};
      const colB = bounds[`${name}[i].length`] || {};
      const elemB = bounds[`${name}[i][j]`] || {};
      pc.minRows = Math.max(1, rowB.min ?? 1);
      pc.maxRows = Math.min(50, rowB.max ?? 5);
      pc.minCols = Math.max(1, colB.min ?? 1);
      pc.maxCols = Math.min(50, colB.max ?? 5);
      pc.elemMin = elemB.min ?? 0;
      pc.elemMax = elemB.max ?? 9;
      break;
    }
    case 'string':
    case 'stringArray': {
      const lenB = bounds[`${name}.length`] || {};
      pc.minLen  = Math.max(1,   lenB.min ?? 1);
      pc.maxLen  = Math.min(100000, lenB.max ?? 20);
      pc.charset = bounds['__charset__'] || 'abcdefghijklmnopqrstuvwxyz';
      break;
    }
    case 'int':
    case 'longlong': {
      const b = bounds[name] || {};
      pc.min = b.min ?? 0;
      pc.max = b.max ?? 100;
      pc.min = Math.max(-1e9, pc.min);
      pc.max = Math.min(1e9,  pc.max);
      break;
    }
    case 'bool': {
      pc.min = 0; pc.max = 1;
      break;
    }
    default: {
      pc.min = 0; pc.max = 100;
    }
  }
  return pc;
}

// ── Default constraints when no text available ────────────────────────────────

function buildDefaultConstraints(params) {
  const defaults = {
    intArray:    { minLen: 1, maxLen: 15, elemMin: -100, elemMax: 100 },
    longArray:   { minLen: 1, maxLen: 15, elemMin: -1000, elemMax: 1000 },
    charArray:   { minLen: 1, maxLen: 15, elemMin: 0, elemMax: 25 },
    matrix:      { minRows: 1, maxRows: 4, minCols: 1, maxCols: 4, elemMin: 0, elemMax: 9 },
    charMatrix:  { minRows: 1, maxRows: 4, minCols: 1, maxCols: 4, elemMin: 0, elemMax: 1 },
    string:      { minLen: 1, maxLen: 15, charset: 'abcdefghijklmnopqrstuvwxyz' },
    stringArray: { minLen: 1, maxLen: 15, charset: 'abcdefghijklmnopqrstuvwxyz' },
    int:         { min: 0, max: 100 },
    longlong:    { min: -1000, max: 1000 },
    bool:        { min: 0, max: 1 },
  };
  return {
    params: params.map(p => ({ ...p, ...(defaults[p.cppType] || defaults.int) })),
    flags: { sorted: false, unique: false, charset: 'abcdefghijklmnopqrstuvwxyz' },
  };
}

// ── Detect problem type from param list ───────────────────────────────────────

export function detectProblemType(params) {
  if (!params || !params.length) return 'unknown';
  const t = params.map(p => p.cppType);
  if (t[0] === 'matrix' || t[0] === 'charMatrix') return 'matrix';
  if (t[0] === 'string')     return 'string';
  if (t[0] === 'intArray' && t[1] === 'int')     return 'two-sum-style';
  if (t[0] === 'intArray' && t[1] === 'intArray') return 'two-arrays';
  if (t[0] === 'intArray')   return 'single-array';
  if (t[0] === 'int')        return 'int-only';
  return 'unknown';
}
