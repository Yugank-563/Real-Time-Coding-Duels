/**
 * typeRegistry.js — Single source of truth for C++ type → reader/printer mapping.
 *
 * Each entry:
 *   { test: (typeStr) => boolean,   // type detection predicate
 *     reader: (varName, idx) => string,   // emits C++ read statement
 *     printer: (callExpr) => string }     // emits C++ print statement
 *
 * Order matters: entries are tested top-to-bottom, first match wins.
 * More specific patterns must come before less specific ones.
 */

import {
  readVectorVectorInt, readVectorInt, readVectorString, readVectorChar,
  readVectorVectorChar, readString, readBool, readLongLong, readDouble,
  readChar, readListNode, readTreeNode, readInt
} from './readers.js';

import {
  printVectorVectorInt, printVectorInt, printVectorString, printVectorChar,
  printVectorVectorChar, printString, printBool, printLongLong, printDouble,
  printChar, printListNode, printTreeNode, printInt
} from './printers.js';

/**
 * The ordered registry array.
 * Reader signature:  (varName: string, idx: number) => string
 * Printer signature: (callExpr: string) => string
 */
export const typeRegistry = [
  // ── vector<vector<int>> ────────────────────────────────────────────────────
  {
    name: 'vector<vector<int>>',
    test: t => /vector\s*<\s*vector\s*<\s*int/i.test(t),
    reader: readVectorVectorInt,
    printer: printVectorVectorInt,
    needsVVC: false,
    needsListNode: false,
    needsTreeNode: false,
  },

  // ── vector<vector<char>> ──────────────────────────────────────────────────
  {
    name: 'vector<vector<char>>',
    test: t => /vector\s*<\s*vector\s*<\s*char/i.test(t),
    reader: readVectorVectorChar,
    printer: printVectorVectorChar,
    needsVVC: true,
    needsListNode: false,
    needsTreeNode: false,
  },

  // ── vector<int> ───────────────────────────────────────────────────────────
  {
    name: 'vector<int>',
    test: t => /vector\s*<\s*int/i.test(t),
    reader: readVectorInt,
    printer: printVectorInt,
    needsVVC: false,
    needsListNode: false,
    needsTreeNode: false,
  },

  // ── vector<string> ────────────────────────────────────────────────────────
  {
    name: 'vector<string>',
    test: t => /vector\s*<\s*string/i.test(t),
    reader: readVectorString,
    printer: printVectorString,
    needsVVC: false,
    needsListNode: false,
    needsTreeNode: false,
  },

  // ── vector<char> ──────────────────────────────────────────────────────────
  {
    name: 'vector<char>',
    test: t => /vector\s*<\s*char/i.test(t),
    reader: readVectorChar,
    printer: printVectorChar,
    needsVVC: false,
    needsListNode: false,
    needsTreeNode: false,
  },

  // ── ListNode* ─────────────────────────────────────────────────────────────
  {
    name: 'ListNode*',
    test: t => /ListNode/i.test(t),
    reader: readListNode,
    printer: printListNode,
    needsVVC: false,
    needsListNode: true,
    needsTreeNode: false,
  },

  // ── TreeNode* ─────────────────────────────────────────────────────────────
  {
    name: 'TreeNode*',
    test: t => /TreeNode/i.test(t),
    reader: readTreeNode,
    printer: printTreeNode,
    needsVVC: false,
    needsListNode: false,
    needsTreeNode: true,
  },

  // ── string ────────────────────────────────────────────────────────────────
  {
    name: 'string',
    test: t => /string/i.test(t),
    reader: readString,
    printer: printString,
    needsVVC: false,
    needsListNode: false,
    needsTreeNode: false,
  },

  // ── bool ──────────────────────────────────────────────────────────────────
  {
    name: 'bool',
    test: t => /\bbool\b/i.test(t),
    reader: readBool,
    printer: printBool,
    needsVVC: false,
    needsListNode: false,
    needsTreeNode: false,
  },

  // ── long long ─────────────────────────────────────────────────────────────
  {
    name: 'long long',
    test: t => /long\s*long/i.test(t),
    reader: readLongLong,
    printer: printLongLong,
    needsVVC: false,
    needsListNode: false,
    needsTreeNode: false,
  },

  // ── double / float ────────────────────────────────────────────────────────
  {
    name: 'double',
    test: t => /double|float/i.test(t),
    reader: readDouble,
    printer: printDouble,
    needsVVC: false,
    needsListNode: false,
    needsTreeNode: false,
  },

  // ── char (non-vector) ────────────────────────────────────────────────────
  {
    name: 'char',
    test: t => /\bchar\b/i.test(t) && !/vector/i.test(t),
    reader: readChar,
    printer: printChar,
    needsVVC: false,
    needsListNode: false,
    needsTreeNode: false,
  },

  // ── int (catch-all) ───────────────────────────────────────────────────────
  {
    name: 'int',
    test: _t => true,   // fallback — matches everything remaining
    reader: readInt,
    printer: printInt,
    needsVVC: false,
    needsListNode: false,
    needsTreeNode: false,
  },
];

/**
 * Look up a registry entry by C++ type string.
 * Returns the FIRST matching entry (order matters).
 * @param {string} typeStr - e.g. "vector<int>", "TreeNode*", "bool"
 * @returns {object|null} - registry entry or null if nothing matched
 */
export function lookupType(typeStr) {
  return typeRegistry.find(e => e.test(typeStr)) || null;
}

export default typeRegistry;
