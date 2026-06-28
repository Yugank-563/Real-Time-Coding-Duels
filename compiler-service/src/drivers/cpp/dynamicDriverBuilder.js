/**
 * dynamicDriverBuilder.js
 *
 * Dynamic C++ AST parser and driver generator.
 * Delegates type-to-reader/printer lookups to typeRegistry.js.
 *
 * Step A  — public-section isolation
 * Step B  — method signature collection regex
 * Step C  — primary method selection / returnTypePriority
 * Step D  — template-bracket-aware parameter splitting
 * Step E  — registry-driven reader generation
 * Step F  — registry-driven printer generation
 * Step G  — I/O helper functions block (emitted verbatim)
 */

import { lookupType } from './typeRegistry.js';
import { printVoidMutatedParam } from './printers.js';

// ─── Step G: shared I/O helper functions (emitted verbatim into every driver) ──
const IO_HELPERS = `
// ── Dynamic I/O Helpers ──────────────────────────────────────────────────────
string _readLine() {
    string s;
    if (!getline(cin, s)) return "";
    while (!s.empty() && (s.back() == '\\r' || s.back() == ' ')) s.pop_back();
    return s;
}
vector<int> _parseVI(string s) {
    vector<int> v;
    if (s.empty()) return v;
    if (s.find('[') != string::npos || s.find(',') != string::npos) {
        for (char& c : s) if (c == '[' || c == ']') c = ' ';
        stringstream ss(s);
        string t;
        while (getline(ss, t, ',')) {
            while (!t.empty() && isspace((unsigned char)t.front())) t.erase(t.begin());
            while (!t.empty() && isspace((unsigned char)t.back()))  t.pop_back();
            if (!t.empty()) try { v.push_back(stoi(t)); } catch(...) {}
        }
    } else {
        int n = 0;
        try { n = stoi(s); } catch(...) { return v; }
        for (int i = 0; i < n; i++) {
            int val;
            if (cin >> val) v.push_back(val);
        }
        string dummy;
        getline(cin, dummy);
    }
    return v;
}
vector<vector<int>> _parseVVI(string s) {
    vector<vector<int>> res;
    if (s.empty()) return res;
    if (s.find('[') != string::npos) {
        int first = s.find('[');
        int last = s.rfind(']');
        if (first != string::npos && last != string::npos && first < last) {
            s = s.substr(first + 1, last - first - 1);
        }
        int i = 0, n = (int)s.size();
        while (i < n) {
            if (s[i] == '[') {
                int j = i + 1, d = 1;
                while (j < n && d > 0) { if (s[j]=='[') d++; else if (s[j]==']') d--; j++; }
                string sub = s.substr(i, j - i);
                if (!sub.empty()) res.push_back(_parseVI(sub));
                i = j;
            } else i++;
        }
    } else {
        stringstream ss(s);
        int n = 0, m = 0;
        ss >> n >> m;
        for (int i = 0; i < n; i++) {
            vector<int> row;
            for (int j = 0; j < m; j++) {
                int val;
                if (cin >> val) row.push_back(val);
            }
            res.push_back(row);
        }
        string dummy;
        getline(cin, dummy);
    }
    return res;
}
vector<string> _parseVS(string s) {
    vector<string> v;
    bool in_str = false;
    bool escape = false;
    string cur = "";
    for (char c : s) {
        if (!in_str) {
            if (c == '"') { in_str = true; escape = false; cur = ""; }
        } else {
            if (escape) {
                if (c == 'n') cur += '\\n';
                else if (c == 't') cur += '\\t';
                else if (c == '\\\\') cur += '\\\\';
                else cur += c;
                escape = false;
            } else if (c == '\\\\') {
                escape = true;
            } else if (c == '"') {
                v.push_back(cur);
                in_str = false;
            } else {
                cur += c;
            }
        }
    }
    return v;
}
vector<char> _parseVC(string s) {
    vector<char> v;
    vector<string> vs = _parseVS(s);
    for (const string& str : vs) {
        if (!str.empty()) v.push_back(str[0]);
    }
    return v;
}
string _printVI(const vector<int>& v) {
    string o = "[";
    for (int i = 0; i < (int)v.size(); i++) { o += to_string(v[i]); if (i+1<(int)v.size()) o += ","; }
    return o + "]";
}
string _printVVI(const vector<vector<int>>& vv) {
    string o = "[";
    for (int i = 0; i < (int)vv.size(); i++) { o += _printVI(vv[i]); if (i+1<(int)vv.size()) o += ","; }
    return o + "]";
}
string _escapeStr(const string& s) {
    string res;
    for(char c : s) {
        if(c == '"') res += "\\\\\\"";
        else if(c == '\\\\') res += "\\\\\\\\";
        else res += c;
    }
    return res;
}
string _printVS(const vector<string>& vs) {
    string o = "[";
    for (int i = 0; i < (int)vs.size(); i++) { o += "\\"" + _escapeStr(vs[i]) + "\\""; if (i+1<(int)vs.size()) o += ","; }
    return o + "]";
}
string _printVC(const vector<char>& vc) {
    string o = "[";
    for (int i = 0; i < (int)vc.size(); i++) { o += "\\"" + _escapeStr(string(1, vc[i])) + "\\""; if (i+1<(int)vc.size()) o += ","; }
    return o + "]";
}
// ─────────────────────────────────────────────────────────────────────────────`;

// ─── ListNode helpers (emitted when ListNode is detected in signature) ────────
const LIST_NODE_HELPERS = ``;   // No extra helpers needed; readListNode is self-contained.

// ─── TreeNode helpers (emitted when TreeNode is detected in signature) ────────
const TREE_NODE_HELPERS = `
TreeNode* _buildTree(const string& s) {
    if (s.empty()) return nullptr;
    vector<string> nodes;
    stringstream ss(s);
    string token;
    while (getline(ss, token, ',')) {
        nodes.push_back(token);
    }
    if (nodes.empty() || nodes[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(nodes[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < nodes.size()) {
        TreeNode* curr = q.front();
        q.pop();
        if (i < nodes.size() && nodes[i] != "null") {
            curr->left = new TreeNode(stoi(nodes[i]));
            q.push(curr->left);
        }
        i++;
        if (i < nodes.size() && nodes[i] != "null") {
            curr->right = new TreeNode(stoi(nodes[i]));
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

string _serializeTree(TreeNode* root) {
    if (!root) return "";
    string res = "";
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front();
        q.pop();
        if (curr) {
            res += to_string(curr->val) + ",";
            q.push(curr->left);
            q.push(curr->right);
        } else {
            res += "null,";
        }
    }
    while (res.size() >= 5 && res.substr(res.size() - 5) == "null,") {
        res.erase(res.size() - 5);
    }
    if (!res.empty() && res.back() == ',') res.pop_back();
    return res;
}`;

// ─── VVC helpers (emitted when vector<vector<char>> is detected) ──────────────
const VVC_HELPERS = `
vector<vector<char>> _parseVVC(string s) {
    vector<vector<char>> res;
    if (s.empty()) return res;
    if (s.find('[') != string::npos) {
        int first = s.find('[');
        int last = s.rfind(']');
        if (first != string::npos && last != string::npos && first < last) {
            s = s.substr(first + 1, last - first - 1);
        }
        int i = 0, n = (int)s.size();
        while (i < n) {
            if (s[i] == '[') {
                int j = i + 1, d = 1;
                while (j < n && d > 0) { if (s[j]=='[') d++; else if (s[j]==']') d--; j++; }
                string sub = s.substr(i, j - i);
                if (!sub.empty()) {
                    vector<char> row;
                    for (char& c : sub) if (c == '[' || c == ']' || c == '"') c = ' ';
                    stringstream ss(sub);
                    string t;
                    while (getline(ss, t, ',')) {
                        while (!t.empty() && isspace((unsigned char)t.front())) t.erase(t.begin());
                        while (!t.empty() && isspace((unsigned char)t.back()))  t.pop_back();
                        if (!t.empty()) row.push_back(t[0]);
                    }
                    res.push_back(row);
                }
                i = j;
            } else i++;
        }
    }
    return res;
}
string _printVVC(const vector<vector<char>>& vvc) {
    string o = "[";
    for (size_t i = 0; i < vvc.size(); i++) {
        o += "[";
        for (size_t j = 0; j < vvc[i].size(); j++) {
            o += "\\"" + string(1, vvc[i][j]) + "\\"";
            if (j + 1 < vvc[i].size()) o += ",";
        }
        o += "]";
        if (i + 1 < vvc.size()) o += ",";
    }
    return o + "]";
}`;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a complete C++ main() driver string using the type registry.
 *
 * @param {string} code - The user's C++ solution code (class Solution { ... })
 * @returns {{ driver: string, needsListNode: boolean, needsTreeNode: boolean }}
 *   driver        - the generated driver string (helpers + main block)
 *   needsListNode - true if ListNode* appears in any param/return type
 *   needsTreeNode - true if TreeNode* appears in any param/return type
 */
export function buildDynamicDriver(code) {
    // ── Step A: Isolate the public section of class Solution ──────────────────
    let searchArea = code;
    const pubIdx = code.indexOf('public:');
    if (pubIdx !== -1) {
        searchArea = code.substring(pubIdx + 'public:'.length);
    }

    // ── Step B: Collect all method signatures in the public section ──────────
    const allMethods = [];
    const sigRegex = /([\w:<>*&\s,]+?)\s+([a-z]\w*)\s*\(([^)]*)\)\s*(?:const\s*)?\{/g;
    let m;
    while ((m = sigRegex.exec(searchArea)) !== null) {
        const returnType = m[1].trim();
        const name = m[2].trim();
        const paramsStr = m[3].trim();
        if (['if', 'for', 'while', 'switch', 'catch', 'do'].includes(name)) continue;
        allMethods.push({ returnType, name, paramsStr });
    }

    if (!allMethods.length) {
        return {
            driver: `\nint main() {\n    return 0;\n}\n`,
            needsListNode: false,
            needsTreeNode: false,
        };
    }

    // ── Step C: Pick the primary solution method ──────────────────────────────
    function returnTypePriority(rt) {
        if (/vector\s*<\s*vector\s*<\s*vector/i.test(rt)) return 5;
        if (/vector\s*<\s*vector/i.test(rt)) return 4;
        if (/vector/i.test(rt)) return 3;
        if (/string/i.test(rt)) return 2;
        if (/int|long|double|bool|char/i.test(rt)) return 1;
        if (/void/i.test(rt)) return 0;
        return 1;
    }

    const sorted = allMethods
        .map((meth, idx) => ({ ...meth, idx, priority: returnTypePriority(meth.returnType) }))
        .sort((a, b) => b.priority !== a.priority ? b.priority - a.priority : a.idx - b.idx);

    const { returnType: rawReturnType, name: methodName, paramsStr: rawParams } = sorted[0];

    // ── Step D: Template-bracket-aware parameter splitting ────────────────────
    const params = [];
    if (rawParams) {
        let cur = '', depth = 0;
        for (const ch of rawParams) {
            if (ch === '<') depth++;
            else if (ch === '>') depth--;
            if (ch === ',' && depth === 0) { params.push(cur.trim()); cur = ''; }
            else cur += ch;
        }
        if (cur.trim()) params.push(cur.trim());
    }

    // ── Detect struct requirements from params + return type ──────────────────
    const allTypes = [...params, rawReturnType].join(' ');
    const needsListNode = /ListNode/i.test(allTypes);
    const needsTreeNode = /TreeNode/i.test(allTypes);
    const needsVVC = /vector\s*<\s*vector\s*<\s*char/i.test(allTypes);

    // ── Step E: Generate stdin readers via registry ───────────────────────────
    const readers = [];
    const callArgs = [];
    for (let i = 0; i < params.length; i++) {
        const p = params[i];
        const v = `_p${i}`;
        callArgs.push(v);

        const entry = lookupType(p);
        if (entry) {
            readers.push(entry.reader(v, i));
        } else {
            // Absolute fallback: treat as int
            readers.push(`    int ${v}; cin >> ${v}; cin.ignore();`);
        }
    }

    // ── Step F: Generate return-value printer via registry ────────────────────
    const call = `sol.${methodName}(${callArgs.join(', ')})`;
    let printer = '';

    if (/\bvoid\b/i.test(rawReturnType)) {
        // Void: delegate to the dedicated void-mutated-param printer
        printer = printVoidMutatedParam(call, params, callArgs);
    } else {
        const entry = lookupType(rawReturnType);
        if (entry) {
            printer = entry.printer(call);
        } else {
            printer = `    cout << ${call};`;
        }
    }

    // ── Assemble optional helper blocks ──────────────────────────────────────
    const extraHelpers = [
        needsListNode ? LIST_NODE_HELPERS : '',
        needsTreeNode ? TREE_NODE_HELPERS : '',
        needsVVC ? VVC_HELPERS : '',
    ].filter(Boolean).join('\n');

    // ── Step G: Emit the final driver string ──────────────────────────────────
    const driver = `
${IO_HELPERS}
${extraHelpers}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
${readers.join('\n')}
    Solution sol;
${printer}
    return 0;
}
`;

    return { driver, needsListNode, needsTreeNode };
}

export default buildDynamicDriver;
