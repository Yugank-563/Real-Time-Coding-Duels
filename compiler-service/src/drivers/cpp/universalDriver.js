import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HARNESS_PATH = path.resolve(__dirname, '../../harness/cpp/typeHarness.hpp');

/**
 * Universal Dynamic C++ Driver Builder.
 * Uses C++ template metaprogramming via typeHarness.hpp to automatically
 * serialize and deserialize all 1D/2D/3D vectors, primitives, Linked Lists,
 * and Binary Trees with ZERO per-type manual code.
 */
export class UniversalCppDriver {
  /**
   * Parse method signature from user's class Solution.
   * @param {string} code - C++ user code
   * @param {string} problemTitle - Optional problem title for disambiguation
   * @returns {{ methodName: string, returnType: string, params: string[] }}
   */
  parseSignature(code, problemTitle = '') {
    const solutionMatch = code.match(/class\s+Solution\s*\{[\s\S]*?\};/);
    let searchArea = solutionMatch ? solutionMatch[0] : code;

    // Prioritize public section if explicitly defined
    const publicIndex = searchArea.indexOf('public:');
    if (publicIndex !== -1) {
      searchArea = searchArea.substring(publicIndex);
    }

    // Regex matching C++ method signature inside Solution class
    const methodRegex = /([a-zA-Z0-9_<>\s\*\&\:]+?)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{/g;
    let match;
    const candidates = [];

    while ((match = methodRegex.exec(searchArea)) !== null) {
      let returnTypeCandidate = match[1].replace(/\b(public|private|protected)\s*:\s*/g, '').trim();
      const name = match[2].trim();
      const paramsRaw = match[3].trim();

      // Ignore constructors/destructors, control flow statements, or non-methods
      const CXX_RESERVED = new Set(['for', 'while', 'if', 'switch', 'catch', 'Solution', 'else']);
      if (CXX_RESERVED.has(name) || returnTypeCandidate.includes('class')) {
        continue;
      }

      const params = paramsRaw
        ? paramsRaw.split(',').map(p => p.trim())
        : [];

      candidates.push({
        returnType: returnTypeCandidate,
        methodName: name,
        params,
      });
    }

    if (candidates.length === 0) {
      return { returnType: 'int', methodName: 'solve', params: [] };
    }

    if (candidates.length === 1) {
      return candidates[0];
    }

    // Disambiguate if multiple candidate methods exist
    const HELPER_NAMES = new Set(['issafe', 'isvalid', 'check', 'dfs', 'bfs', 'backtrack', 'helper', 'solvehelper', 'recur', 'valid']);
    const titleNorm = problemTitle ? problemTitle.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

    if (titleNorm) {
      for (const cand of candidates) {
        const candNorm = cand.methodName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (candNorm.includes(titleNorm) || titleNorm.includes(candNorm)) {
          return cand;
        }
      }
    }

    // Filter out known helper methods
    const nonHelpers = candidates.filter(c => !HELPER_NAMES.has(c.methodName.toLowerCase()));
    if (nonHelpers.length > 0) {
      return nonHelpers[nonHelpers.length - 1];
    }

    return candidates[0];
  }

  /**
   * Extract target type for _deserialize<T>()
   * Strip reference (&), const, parameter variable names cleanly.
   */
  cleanParamType(paramStr) {
    let t = paramStr.replace(/\bconst\b/g, '').trim();
    // Separate & from identifier names with a space
    t = t.replace(/&/g, ' ').trim();
    // Replace multiple spaces with a single space
    t = t.replace(/\s+/g, ' ');

    const tokens = t.split(' ');
    if (tokens.length > 1) {
      const lastToken = tokens[tokens.length - 1];
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(lastToken) && !['int', 'long', 'char', 'double', 'float', 'bool', 'string', 'unsigned', 'signed', 'short'].includes(lastToken)) {
        tokens.pop();
        t = tokens.join(' ').trim();
      }
    }
    return t;
  }

  /**
   * Wrap user code in a compilable C++ driver using typeHarness.hpp.
   * @param {string} code - User C++ code
   * @param {string} problemTitle - Optional problem title
   * @returns {string} - Complete compilable C++ program
   */
  wrap(code, problemTitle = '') {
    const sig = this.parseSignature(code, problemTitle);

    const headerInclude = `#include "${HARNESS_PATH}"`;

    // Generate parameter reading lines
    const paramReads = [];
    const callArgs = [];

    sig.params.forEach((p, idx) => {
      const cleanType = this.cleanParamType(p);
      const varName = `_p${idx}`;
      paramReads.push(`    auto ${varName} = _deserialize<${cleanType}>(_readLine());`);
      callArgs.push(varName);
    });

    const isVoid = sig.returnType === 'void';
    let executionBlock = '';

    if (isVoid) {
      // Handle void return by serializing the first mutated parameter
      const firstArg = callArgs.length > 0 ? callArgs[0] : '';
      executionBlock = `    sol.${sig.methodName}(${callArgs.join(', ')});\n    cout << _serialize(${firstArg});`;
    } else {
      executionBlock = `    auto _r = sol.${sig.methodName}(${callArgs.join(', ')});\n    cout << _serialize(_r);`;
    }

    return `${headerInclude}

// %%USER_CODE_START%%
${code}
// %%USER_CODE_END%%

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
${paramReads.join('\n')}
    Solution sol;
${executionBlock}
    return 0;
}
`;
  }
}

export default UniversalCppDriver;
