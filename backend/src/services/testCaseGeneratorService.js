/**
 * testCaseGeneratorService.js
 *
 * Generates valid test cases for a LeetCode-style problem by parsing its
 * constraints and producing edge, boundary, and random inputs.
 *
 * Strategy:
 *   1. Always include the problem's own sample testCases first (known outputs).
 *   2. Add edge cases  (~10% of remaining count).
 *   3. Add boundary cases (~20% of remaining count).
 *   4. Fill the rest with random cases (~70%).
 *
 * Never generates more cases than mathematically possible for the constraint
 * domain (capped at 10 000 to avoid runaway generation).
 */

import {
  parseBoilerplate,
  parseConstraints,
  extractConstraintText,
} from './constraintParser.js';
import { TestCase } from '../models/index.js';

// ────────────────────────────────────────────────────────────────────────────
// Random helpers
// ────────────────────────────────────────────────────────────────────────────

function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  if (min > max) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randArray(len, elemMin, elemMax, unique = false, sorted = false) {
  const arr = [];
  const used = new Set();
  const range = elemMax - elemMin + 1;
  const canBeUnique = range >= len;

  for (let i = 0; i < len; i++) {
    let v = randInt(elemMin, elemMax);
    if (unique && canBeUnique) {
      let attempts = 0;
      while (used.has(v) && attempts < 500) {
        v = randInt(elemMin, elemMax);
        attempts++;
      }
      used.add(v);
    }
    arr.push(v);
  }
  if (sorted) arr.sort((a, b) => a - b);
  return arr;
}

function randString(len, charset) {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += charset[Math.floor(Math.random() * charset.length)];
  }
  return s;
}

function formatArray(arr)  { return '[' + arr.join(',') + ']'; }
function formatMatrix(mat) { return '[' + mat.map(row => '[' + row.join(',') + ']').join(',') + ']'; }

// ────────────────────────────────────────────────────────────────────────────
// Per-param value generator
// ────────────────────────────────────────────────────────────────────────────

/**
 * variant: 'random' | 'edge-min' | 'edge-max' | 'edge-zeros' | 'edge-same' |
 *          'boundary-lo' | 'boundary-hi'
 */
function generateParamValue(pc, flags, variant = 'random') {
  const { cppType } = pc;

  // ── Integer array ──────────────────────────────────────────────────────────
  if (cppType === 'intArray' || cppType === 'longArray' || cppType === 'charArray') {
    let len;
    switch (variant) {
      case 'edge-min':     len = pc.minLen; break;
      case 'edge-max':     len = pc.maxLen; break;
      case 'boundary-lo':  len = Math.min(pc.minLen + 1, pc.maxLen); break;
      case 'boundary-hi':  len = Math.max(pc.maxLen - 1, pc.minLen); break;
      case 'edge-zeros':   len = Math.min(5, pc.maxLen); break;
      case 'edge-same':    len = randInt(pc.minLen, Math.min(8, pc.maxLen)); break;
      case 'stress-sorted':
      case 'stress-reverse':
      case 'stress-same':
      case 'stress-extremes':
      case 'stress-max':   len = pc.maxLen; break;
      default:             len = randInt(pc.minLen, pc.maxLen);
    }

    if (variant === 'edge-zeros') {
      const fillVal = (0 >= pc.elemMin && 0 <= pc.elemMax) ? 0 : pc.elemMin;
      return formatArray(new Array(len).fill(fillVal));
    }
    if (variant === 'edge-same' || variant === 'stress-same') {
      const val = randInt(pc.elemMin, pc.elemMax);
      return formatArray(new Array(len).fill(val));
    }
    if (variant === 'stress-extremes') {
      const arr = [];
      for (let i = 0; i < len; i++) {
        arr.push(i % 2 === 0 ? pc.elemMax : pc.elemMin);
      }
      return formatArray(arr);
    }

    // For edge-min/max use extreme element values
    const eMin = (variant === 'edge-min' || variant === 'boundary-lo') ? pc.elemMin : pc.elemMin;
    const eMax = (variant === 'edge-max' || variant === 'boundary-hi') ? pc.elemMax : pc.elemMax;
    let arr = randArray(len, eMin, eMax, flags.unique, flags.sorted || variant === 'stress-sorted');
    
    if (variant === 'stress-reverse') {
      arr = randArray(len, eMin, eMax, flags.unique, true).reverse();
    }
    return formatArray(arr);
  }

  // ── Matrix ─────────────────────────────────────────────────────────────────
  if (cppType === 'matrix' || cppType === 'charMatrix') {
    let rows, cols;
    if (variant === 'edge-min')    { rows = pc.minRows; cols = pc.minCols; }
    else if (variant === 'edge-max') { rows = pc.maxRows; cols = pc.maxCols; }
    else { rows = randInt(pc.minRows, pc.maxRows); cols = randInt(pc.minCols, pc.maxCols); }
    const mat = [];
    for (let r = 0; r < rows; r++) mat.push(randArray(cols, pc.elemMin, pc.elemMax));
    return formatMatrix(mat);
  }

  // ── String ─────────────────────────────────────────────────────────────────
  if (cppType === 'string' || cppType === 'stringArray') {
    let len;
    if (variant === 'edge-min') len = pc.minLen;
    else if (variant === 'edge-max') len = pc.maxLen;
    else len = randInt(pc.minLen, pc.maxLen);
    const generatedStr = randString(len, pc.charset || 'abcdefghijklmnopqrstuvwxyz');
    return '"' + generatedStr + '"';
  }

  // ── Scalar integer ─────────────────────────────────────────────────────────
  if (cppType === 'int' || cppType === 'longlong') {
    switch (variant) {
      case 'edge-min':    return String(pc.min);
      case 'edge-max':
      case 'stress-max':  return String(pc.max);
      case 'stress-extremes': return Math.random() > 0.5 ? String(pc.max) : String(pc.min);
      case 'boundary-lo': return String(Math.min(pc.min + 1, pc.max));
      case 'boundary-hi': return String(Math.max(pc.max - 1, pc.min));
      default:            return String(randInt(pc.min, pc.max));
    }
  }

  // ── Bool ───────────────────────────────────────────────────────────────────
  if (cppType === 'bool') {
    return Math.random() > 0.5 ? 'true' : 'false';
  }

  return String(randInt(0, 100));
}

function generateAllParams(paramConstraints, flags, variant) {
  return paramConstraints.map(pc => generateParamValue(pc, flags, variant));
}

// ────────────────────────────────────────────────────────────────────────────
// Max possible unique test case estimate
// ────────────────────────────────────────────────────────────────────────────

function calcMaxPossible(parsed) {
  if (!parsed || !parsed.params.length) return 1000;
  let total = 1;
  for (const pc of parsed.params) {
    let domain;
    switch (pc.cppType) {
      case 'intArray':
      case 'longArray':
        domain = (pc.maxLen - pc.minLen + 1) *
                 Math.min(1000, pc.elemMax - pc.elemMin + 1);
        break;
      case 'matrix':
        domain = pc.maxRows * pc.maxCols * Math.min(100, pc.elemMax - pc.elemMin + 1);
        break;
      case 'string':
        domain = (pc.maxLen - pc.minLen + 1) * (pc.charset?.length || 26);
        break;
      case 'int':
      case 'longlong':
        domain = Math.min(10000, pc.max - pc.min + 1);
        break;
      default:
        domain = 100;
    }
    total = Math.min(total * Math.max(1, domain), 10000);
  }
  return Math.max(1, Math.round(total));
}

// ────────────────────────────────────────────────────────────────────────────
// Main export: generateTestCases
// ────────────────────────────────────────────────────────────────────────────

/**
 * @param {Object} problem    — MongoDB Problem document (or equivalent)
 * @param {number} targetCount — desired number of test cases (e.g. 10 or 50)
 * @returns {Array<{ input, output, caseNumber, type }>}
 */
export async function generateTestCases(problem, targetCount = 10) {
  const cppBoilerplate  = problem.boilerplates?.cpp || '';
  const contentHtml     = problem.content || '';

  // 1. Parse params from boilerplate
  const params = parseBoilerplate(cppBoilerplate);

  // 2. Extract constraint text and parse bounds
  const constraintText = extractConstraintText(contentHtml);
  const parsed = params.length
    ? parseConstraints(constraintText, params)
    : { params: [{ name: 'x', cppType: 'int', min: 0, max: 100 }], flags: {} };

  const { params: paramConstraints, flags } = parsed;

  // 3. Cap at what is mathematically possible
  const maxPossible = calcMaxPossible(parsed);
  const count       = Math.min(targetCount, maxPossible, 200);

  const cases = [];

  // ── 4a. Sample TCs first (known expected output → WA detection) ───────────
  const sampleTCs = (problem.testCases || []).filter(tc => tc.input && tc.input.trim());
  for (const tc of sampleTCs) {
    if (cases.length >= count) break;
    cases.push({
      input:      tc.input.trim(),
      output:     tc.output?.trim() || '',
      caseNumber: cases.length + 1,
      type:       'sample',
    });
  }

  if (cases.length >= count) return cases;

  const remaining  = count - cases.length;

  // ── 4b. Edge cases ────────────────────────────────────────────────────────
  const edgeCount    = Math.max(2, Math.floor(remaining * 0.15));
  const edgeVariants = ['edge-min', 'edge-max', 'edge-zeros', 'edge-same'];
  for (let i = 0; i < Math.min(edgeCount, edgeVariants.length); i++) {
    if (cases.length >= count) break;
    const inputs = generateAllParams(paramConstraints, flags, edgeVariants[i]);
    cases.push({
      input:      inputs.join('\n'),
      output:     '',
      caseNumber: cases.length + 1,
      type:       'edge',
    });
  }

  // ── 4c. Boundary cases ────────────────────────────────────────────────────
  const boundaryCount    = Math.max(2, Math.floor(remaining * 0.20));
  const boundaryVariants = ['boundary-lo', 'boundary-hi'];
  for (let i = 0; i < boundaryCount; i++) {
    if (cases.length >= count) break;
    const v      = boundaryVariants[i % 2];
    const inputs = generateAllParams(paramConstraints, flags, v);
    cases.push({
      input:      inputs.join('\n'),
      output:     '',
      caseNumber: cases.length + 1,
      type:       'boundary',
    });
  }

  // ── 4d. Stress cases ──────────────────────────────────────────────────────
  const stressCount = Math.max(2, Math.floor(remaining * 0.15));
  const stressVariants = ['stress-max', 'stress-sorted', 'stress-reverse', 'stress-same', 'stress-extremes'];
  for (let i = 0; i < Math.min(stressCount, stressVariants.length); i++) {
    if (cases.length >= count) break;
    const inputs = generateAllParams(paramConstraints, flags, stressVariants[i]);
    cases.push({
      input:      inputs.join('\n'),
      output:     '',
      caseNumber: cases.length + 1,
      type:       'stress',
    });
  }

  // ── 4e. Random cases (fill remainder) ────────────────────────────────────
  const seenInputs = new Set(cases.map(c => c.input));
  let randomAttempts = 0;
  while (cases.length < count && randomAttempts < count * 4) {
    randomAttempts++;
    const inputs = generateAllParams(paramConstraints, flags, 'random');
    const key    = inputs.join('|');
    if (seenInputs.has(key)) continue;
    seenInputs.add(key);
    cases.push({
      input:      inputs.join('\n'),
      output:     '',
      caseNumber: cases.length + 1,
      type:       'random',
    });
  }

  // 5. Store generated cases in DB
  const finalCases = cases.slice(0, count);
  if (problem._id) {
    try {
      // Clear old generated cases for this problem
      await TestCase.deleteMany({ problemId: problem._id, isGenerated: true });
      
      const tcDocs = finalCases.map((tc, index) => ({
        problemId: problem._id,
        type: tc.type || 'hidden',
        caseNumber: index + 1,
        input: tc.input,
        output: tc.output,
        isGenerated: true,
      }));
      
      await TestCase.insertMany(tcDocs);
    } catch (err) {
      console.error('[TestCaseGenerator] Failed to persist test cases:', err.message);
    }
  }

  return finalCases;
}

export default generateTestCases;
