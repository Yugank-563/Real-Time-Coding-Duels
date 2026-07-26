/**
 * cppDriver.js  — C++ Driver
 *
 * This file provides the registry-powered C++ driver.
 *
 * Flow in wrap(code, problemTitle):
 *   1. Normalize the title
 *   2. Check the named exceptions map
 *   3. Detect ListNode / TreeNode from actual signature → pick header
 *   4. Call buildDynamicDriver() → registry-driven main() generation
 *   5. Return header + code + driver
 *
 * NOTE: The exceptions map in this file handles specific problems that
 * the generic AST registry CANNOT generalize.
 */

import BaseDriver from '../base.driver.js';
import { buildDynamicDriver } from './dynamicDriverBuilder.js';
import {
  sudokuSolverDriver,
  linkedListCycleDriver,
  reorderListDriver
} from './customDrivers.js';


// ─── Named exceptions map ────────────────────────────────────────────────────
// Key: normalized title (trim().toLowerCase())
// Value: function(code) => driver string
const EXCEPTIONS = {
  'sudoku solver':     sudokuSolverDriver,
  'linked list cycle': linkedListCycleDriver,
  'reorder list':      reorderListDriver,
  // Add future true exceptions here, one entry per problem.
};

// Which header does each exception need?
const EXCEPTION_HEADERS = {
  'sudoku solver':     'standard',
  'linked list cycle': 'listnode',
  'reorder list':      'listnode',
};

// ─── Shared C++ headers ──────────────────────────────────────────────────────
const STANDARD_IMPORTS = `
#pragma GCC diagnostic error "-Wreturn-type"
#include <bits/stdc++.h>

using namespace std;
`;

const LIST_NODE_DEF = `
#pragma GCC diagnostic error "-Wreturn-type"
#include <bits/stdc++.h>

using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode* next) : val(x), next(next) {}
};
`;

const TREE_NODE_DEF = `
#pragma GCC diagnostic error "-Wreturn-type"
#include <bits/stdc++.h>

using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode* left, TreeNode* right) : val(x), left(left), right(right) {}
};
`;

const LIST_AND_TREE_DEF = `
#pragma GCC diagnostic error "-Wreturn-type"
#include <bits/stdc++.h>

using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode* next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode* left, TreeNode* right) : val(x), left(left), right(right) {}
};
`;

// ────────────────────────────────────────────────────────────────────────────

export class RegistryCppDriver extends BaseDriver {
  /**
   * Wrap user C++ code in a compilable driver program.
   * Uses the type registry for all type detection — zero problem-name hardcoding
   * except for confirmed true exceptions in the EXCEPTIONS map.
   *
   * @param {string} code         - User's C++ solution (class Solution { ... })
   * @param {string} problemTitle - Problem title (used only for exception lookup)
   * @returns {string} - Complete compilable C++ source
   */
  wrap(code, problemTitle) {
    // Step 1: Normalize title
    const titleNorm = (problemTitle || '').trim().toLowerCase();

    // Step 2: Check named exceptions first — use correct header per exception
    if (EXCEPTIONS[titleNorm]) {
      const exHeaderType = EXCEPTION_HEADERS[titleNorm] || 'standard';
      const exHeader = exHeaderType === 'listnode' ? LIST_NODE_DEF
                     : exHeaderType === 'treenode' ? TREE_NODE_DEF
                     : STANDARD_IMPORTS;
      return `${exHeader}\n// %%USER_CODE_START%%\n${code}\n${EXCEPTIONS[titleNorm](code)}`;
    }

    // Step 3: Build driver via type registry (detects ListNode/TreeNode from sig)
    const { driver, needsListNode, needsTreeNode } = buildDynamicDriver(code);

    // Step 4: Pick the right header based on detected struct requirements
    let header;
    if (needsListNode && needsTreeNode) {
      header = LIST_AND_TREE_DEF;
    } else if (needsListNode) {
      header = LIST_NODE_DEF;
    } else if (needsTreeNode) {
      header = TREE_NODE_DEF;
    } else {
      header = STANDARD_IMPORTS;
    }

    // Step 5: Assemble and return
    return `${header}\n// %%USER_CODE_START%%\n${code}\n${driver}`;
  }
}

export default RegistryCppDriver;
