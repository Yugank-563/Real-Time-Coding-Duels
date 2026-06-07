import BaseDriver from './base.driver.js';

/**
 * Generates a dynamic C++ main() driver for any LeetCode-style solution class.
 * Parses the function signature from the user's boilerplate to determine param types
 * and return type, then generates stdin readers and stdout formatters automatically.
 */
function generateDynamicCppDriver(code) {
  // ── Step 1: Isolate the public section of class Solution ────────────────────
  // (helper methods inside private/protected won't fool us)
  let searchArea = code;
  const pubIdx = code.indexOf('public:');
  if (pubIdx !== -1) {
    // Extract from "public:" to the closing }; of the class
    searchArea = code.substring(pubIdx + 'public:'.length);
  }

  // ── Step 2: Collect ALL method signatures in the public section ─────────────
  // returnType must appear at start-of-line (after indentation) and methodName
  // must start with a lowercase letter (LeetCode convention; constructors/
  // destructor start with uppercase or ~).
  const allMethods = [];
  const sigRegex = /([\w:<>*&\s,]+?)\s+([a-z]\w*)\s*\(([^)]*)\)\s*(?:const\s*)?\{/g;
  let m;
  while ((m = sigRegex.exec(searchArea)) !== null) {
    const returnType = m[1].trim();
    const name       = m[2].trim();
    const paramsStr  = m[3].trim();
    // Skip obvious helper-call false-matches (e.g. if / for / while)
    if (['if', 'for', 'while', 'switch', 'catch', 'do'].includes(name)) continue;
    allMethods.push({ returnType, name, paramsStr });
  }

  if (!allMethods.length) {
    return `\nint main() {\n    return 0;\n}\n`;
  }

  // ── Step 3: Pick the PRIMARY solution method ─────────────────────────────────
  // Priority: prefer non-void return types, and prefer richer return types
  // (vector<vector<int>> > vector<int> > int/bool/string > void)
  function returnTypePriority(rt) {
    if (/vector\s*<\s*vector\s*<\s*vector/i.test(rt)) return 5;
    if (/vector\s*<\s*vector/i.test(rt))              return 4;
    if (/vector/i.test(rt))                           return 3;
    if (/string/i.test(rt))                           return 2;
    if (/int|long|double|bool|char/i.test(rt))        return 1;
    if (/void/i.test(rt))                             return 0;
    return 1;
  }

  // Sort by priority descending, but keep FIRST method's index as tiebreaker
  // (first method wins when priority is equal — LeetCode puts the solution first)
  const sorted = allMethods
    .map((meth, idx) => ({ ...meth, idx, priority: returnTypePriority(meth.returnType) }))
    .sort((a, b) => b.priority !== a.priority ? b.priority - a.priority : a.idx - b.idx);

  const { returnType: rawReturnType, name: methodName, paramsStr: rawParams } = sorted[0];

  // ── Step 4: Parse individual parameters (template-bracket-aware) ─────────────
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

  // ── Step 5: Generate stdin readers for each parameter ───────────────────────
  const readers = [];
  const callArgs = [];
  for (let i = 0; i < params.length; i++) {
    const p = params[i];
    const v = `_p${i}`;
    callArgs.push(v);
    if (/vector\s*<\s*vector\s*<\s*int/i.test(p)) {
      readers.push(`    auto ${v} = _parseVVI(_readLine());`);
    } else if (/vector\s*<\s*int/i.test(p)) {
      readers.push(`    auto ${v} = _parseVI(_readLine());`);
    } else if (/vector\s*<\s*string/i.test(p)) {
      readers.push(`    auto ${v} = _parseVS(_readLine());`);
    } else if (/vector\s*<\s*char/i.test(p)) {
      readers.push(`    auto ${v} = _parseVC(_readLine());`);
    } else if (/string/i.test(p)) {
      readers.push(`    string ${v} = _readLine();`);
    } else if (/bool/i.test(p)) {
      readers.push(`    string _bs${i} = _readLine(); bool ${v} = (_bs${i} == "true");`);
    } else if (/long\s*long/i.test(p)) {
      readers.push(`    long long ${v}; cin >> ${v}; cin.ignore();`);
    } else if (/double|float/i.test(p)) {
      readers.push(`    double ${v}; cin >> ${v}; cin.ignore();`);
    } else if (/char/i.test(p) && !/vector/i.test(p)) {
      readers.push(`    char ${v}; cin >> ${v}; cin.ignore();`);
    } else {
      readers.push(`    int ${v}; cin >> ${v}; cin.ignore();`);
    }
  }

  // ── Step 6: Generate return value printer ────────────────────────────────────
  const call = `sol.${methodName}(${callArgs.join(', ')})`;
  let printer = '';
  if (/\bvoid\b/i.test(rawReturnType)) {
    // For void methods (e.g. sortColors, rotate), print first vector/matrix arg
    const matIdx = params.findIndex(p => /vector\s*<\s*vector/i.test(p));
    const vecIdx = params.findIndex(p => /vector\s*<\s*int/i.test(p));
    if (matIdx !== -1) {
      printer = `    ${call};\n    cout << _printVVI(${callArgs[matIdx]});`;
    } else if (vecIdx !== -1) {
      printer = `    ${call};\n    cout << _printVI(${callArgs[vecIdx]});`;
    } else {
      printer = `    ${call};`;
    }
  } else if (/vector\s*<\s*vector\s*<\s*int/i.test(rawReturnType)) {
    printer = `    auto _r = ${call};\n    cout << _printVVI(_r);`;
  } else if (/vector\s*<\s*int/i.test(rawReturnType)) {
    printer = `    auto _r = ${call};\n    cout << _printVI(_r);`;
  } else if (/vector\s*<\s*string/i.test(rawReturnType)) {
    printer = `    auto _r = ${call};\n    cout << _printVS(_r);`;
  } else if (/\bbool\b/i.test(rawReturnType)) {
    printer = `    cout << (${call} ? "true" : "false");`;
  } else {
    printer = `    cout << ${call};`;
  }

  return `
// ── Dynamic I/O Helpers ──────────────────────────────────────────────────────
string _readLine() {
    string s;
    if (!getline(cin, s)) return "";
    while (!s.empty() && (s.back() == '\\r' || s.back() == ' ')) s.pop_back();
    return s;
}
vector<int> _parseVI(string s) {
    vector<int> v;
    for (char& c : s) if (c == '[' || c == ']') c = ' ';
    stringstream ss(s);
    string t;
    while (getline(ss, t, ',')) {
        while (!t.empty() && isspace((unsigned char)t.front())) t.erase(t.begin());
        while (!t.empty() && isspace((unsigned char)t.back()))  t.pop_back();
        if (!t.empty()) try { v.push_back(stoi(t)); } catch(...) {}
    }
    return v;
}
vector<vector<int>> _parseVVI(string s) {
    vector<vector<int>> res;
    int i = 0, n = (int)s.size();
    while (i < n) {
        if (s[i] == '[') {
            int j = i + 1, d = 1;
            while (j < n && d > 0) { if (s[j]=='[') d++; else if (s[j]==']') d--; j++; }
            string sub = s.substr(i + 1, j - i - 2);
            if (!sub.empty()) res.push_back(_parseVI(sub));
            i = j;
        } else i++;
    }
    return res;
}
vector<string> _parseVS(string s) {
    vector<string> v;
    for (char& c : s) if (c == '[' || c == ']' || c == '"') c = ' ';
    stringstream ss(s);
    string t;
    while (getline(ss, t, ',')) {
        while (!t.empty() && isspace((unsigned char)t.front())) t.erase(t.begin());
        while (!t.empty() && isspace((unsigned char)t.back()))  t.pop_back();
        if (!t.empty()) v.push_back(t);
    }
    return v;
}
vector<char> _parseVC(string s) {
    vector<char> v;
    for (char& c : s) if (c == '[' || c == ']' || c == '"') c = ' ';
    stringstream ss(s);
    string t;
    while (getline(ss, t, ',')) {
        while (!t.empty() && isspace((unsigned char)t.front())) t.erase(t.begin());
        while (!t.empty() && isspace((unsigned char)t.back()))  t.pop_back();
        if (!t.empty()) v.push_back(t[0]);
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
string _printVS(const vector<string>& vs) {
    string o = "[";
    for (int i = 0; i < (int)vs.size(); i++) { o += "\\"" + vs[i] + "\\""; if (i+1<(int)vs.size()) o += ","; }
    return o + "]";
}
// ─────────────────────────────────────────────────────────────────────────────

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
${readers.join('\n')}
    Solution sol;
${printer}
    return 0;
}
`;
}


export class CppDriver extends BaseDriver {
  wrap(code, problemTitle) {
    const listNodeDef = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <queue>

using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};
`;

    const treeNodeDef = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <queue>

using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};
`;

    const standardImports = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <stack>
#include <map>
#include <set>

using namespace std;
`;

    const titleNorm = problemTitle.trim().toLowerCase();
    let header = standardImports;
    let driver = '';

    if (titleNorm === 'reverse words in a string') {
      driver = `
int main() {
    string s;
    if (getline(cin, s)) {
        Solution sol;
        cout << sol.reverseWords(s);
    }
    return 0;
}
`;
    } else if (titleNorm === 'reverse linked list') {
      header = listNodeDef;
      driver = `
int main() {
    string s;
    if (getline(cin, s)) {
        if (s.empty()) return 0;
        bool hasBrackets = (s.find('[') != string::npos);
        s.erase(remove(s.begin(), s.end(), '['), s.end());
        s.erase(remove(s.begin(), s.end(), ']'), s.end());
        stringstream ss(s);
        string token;
        ListNode* dummy = new ListNode(0);
        ListNode* curr = dummy;
        while (getline(ss, token, ',')) {
            if (!token.empty()) {
                curr->next = new ListNode(stoi(token));
                curr = curr->next;
            }
        }
        Solution sol;
        ListNode* res = sol.reverseList(dummy->next);
        string out = "";
        while (res) {
            out += to_string(res->val) + ",";
            res = res->next;
        }
        if (!out.empty()) out.pop_back();
        if (hasBrackets) cout << "[" << out << "]";
        else cout << out;
    }
    return 0;
}
`;
    } else if (titleNorm === 'valid parentheses') {
      driver = `
int main() {
    string s;
    if (getline(cin, s)) {
        Solution sol;
        cout << (sol.isValid(s) ? "true" : "false");
    }
    return 0;
}
`;
    } else if (titleNorm === 'invert binary tree') {
      header = treeNodeDef;
      driver = `
TreeNode* buildTree(const string& s) {
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

string serialize(TreeNode* root) {
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
}

int main() {
    string s;
    if (getline(cin, s)) {
        bool hasBrackets = (s.find('[') != string::npos);
        s.erase(remove(s.begin(), s.end(), '['), s.end());
        s.erase(remove(s.begin(), s.end(), ']'), s.end());
        TreeNode* root = buildTree(s);
        Solution sol;
        TreeNode* inverted = sol.invertTree(root);
        string out = serialize(inverted);
        if (hasBrackets) cout << "[" << out << "]";
        else cout << out;
    }
    return 0;
}
`;
    } else if (titleNorm === 'climbing stairs') {
      driver = `
int main() {
    int n;
    if (cin >> n) {
        Solution sol;
        cout << sol.climbStairs(n);
    }
    return 0;
}
`;
    } else if (titleNorm === 'subsets') {
      driver = `
int main() {
    string s;
    if (getline(cin, s)) {
        s.erase(remove(s.begin(), s.end(), '['), s.end());
        s.erase(remove(s.begin(), s.end(), ']'), s.end());
        vector<int> nums;
        stringstream ss(s);
        string token;
        while (getline(ss, token, ',')) {
            if (!token.empty()) nums.push_back(stoi(token));
        }
        Solution sol;
        vector<vector<int>> res = sol.subsets(nums);
        for (auto& subset : res) {
            sort(subset.begin(), subset.end());
        }
        sort(res.begin(), res.end(), [](const vector<int>& a, const vector<int>& b) {
            if (a.size() != b.size()) return a.size() < b.size();
            return a < b;
        });
        string out = "";
        for (const auto& subset : res) {
            out += "[";
            for (size_t i = 0; i < subset.size(); ++i) {
                out += to_string(subset[i]);
                if (i + 1 < subset.size()) out += ",";
            }
            out += "],";
        }
        if (!out.empty() && out.back() == ',') out.pop_back();
        cout << out;
    }
    return 0;
}
`;
    } else if (titleNorm === 'merge sorted array') {
      driver = `
int main() {
    string s1, s2, temp;
    int m = 0, n = 0;
    if (getline(cin, s1) && getline(cin, temp)) {
        bool hasBrackets = (s1.find('[') != string::npos);
        s1.erase(remove(s1.begin(), s1.end(), '['), s1.end());
        s1.erase(remove(s1.begin(), s1.end(), ']'), s1.end());
        m = stoi(temp);
        vector<int> nums1;
        stringstream ss1(s1);
        string token;
        while (getline(ss1, token, ',')) {
            if (!token.empty()) nums1.push_back(stoi(token));
        }
        if (getline(cin, s2) && getline(cin, temp)) {
            s2.erase(remove(s2.begin(), s2.end(), '['), s2.end());
            s2.erase(remove(s2.begin(), s2.end(), ']'), s2.end());
            n = stoi(temp);
            vector<int> nums2;
            stringstream ss2(s2);
            while (getline(ss2, token, ',')) {
                if (!token.empty()) nums2.push_back(stoi(token));
            }
            Solution sol;
            sol.merge(nums1, m, nums2, n);
            string out = "";
            for (size_t i = 0; i < nums1.size(); ++i) {
                out += to_string(nums1[i]);
                if (i + 1 < nums1.size()) out += ",";
            }
            if (hasBrackets) cout << "[" << out << "]";
            else cout << out;
        }
    }
    return 0;
}
`;
    } else if (titleNorm === 'jump game') {
      driver = `
int main() {
    string s;
    if (getline(cin, s)) {
        s.erase(remove(s.begin(), s.end(), '['), s.end());
        s.erase(remove(s.begin(), s.end(), ']'), s.end());
        vector<int> nums;
        stringstream ss(s);
        string token;
        while (getline(ss, token, ',')) {
            if (!token.empty()) nums.push_back(stoi(token));
        }
        Solution sol;
        cout << (sol.canJump(nums) ? "true" : "false");
    }
    return 0;
}
`;
    } else if (titleNorm === 'single number') {
      driver = `
int main() {
    string s;
    if (getline(cin, s)) {
        s.erase(remove(s.begin(), s.end(), '['), s.end());
        s.erase(remove(s.begin(), s.end(), ']'), s.end());
        vector<int> nums;
        stringstream ss(s);
        string token;
        while (getline(ss, token, ',')) {
            if (!token.empty()) nums.push_back(stoi(token));
        }
        Solution sol;
        cout << sol.singleNumber(nums);
    }
    return 0;
}
`;
    } else if (titleNorm === 'fizz buzz') {
      driver = `
int main() {
    int n;
    if (cin >> n) {
        Solution sol;
        vector<string> res = sol.fizzBuzz(n);
        string out = "";
        for (size_t i = 0; i < res.size(); ++i) {
            out += "\\"" + res[i] + "\\"";
            if (i + 1 < res.size()) out += ",";
        }
        cout << out;
    }
    return 0;
}
`;
    } else if (titleNorm === 'max consecutive ones iii') {
      driver = `
int main() {
    string s, temp;
    if (getline(cin, s) && getline(cin, temp)) {
        s.erase(remove(s.begin(), s.end(), '['), s.end());
        s.erase(remove(s.begin(), s.end(), ']'), s.end());
        vector<int> nums;
        stringstream ss(s);
        string token;
        while (getline(ss, token, ',')) {
            if (!token.empty()) nums.push_back(stoi(token));
        }
        int k = stoi(temp);
        Solution sol;
        cout << sol.longestOnes(nums, k);
    }
    return 0;
}
`;
    } else if (titleNorm === 'valid palindrome') {
      driver = `
int main() {
    string s;
    if (getline(cin, s)) {
        Solution sol;
        cout << (sol.isPalindrome(s) ? "true" : "false");
    }
    return 0;
}
`;
    } else if (titleNorm === 'binary search') {
      driver = `
int main() {
    string s, temp;
    if (getline(cin, s) && getline(cin, temp)) {
        s.erase(remove(s.begin(), s.end(), '['), s.end());
        s.erase(remove(s.begin(), s.end(), ']'), s.end());
        vector<int> nums;
        stringstream ss(s);
        string token;
        while (getline(ss, token, ',')) {
            if (!token.empty()) nums.push_back(stoi(token));
        }
        int target = stoi(temp);
        Solution sol;
        cout << sol.search(nums, target);
    }
    return 0;
}
`;
    } else if (titleNorm === 'kth largest element in an array') {
      driver = `
int main() {
    string s, temp;
    if (getline(cin, s) && getline(cin, temp)) {
        s.erase(remove(s.begin(), s.end(), '['), s.end());
        s.erase(remove(s.begin(), s.end(), ']'), s.end());
        vector<int> nums;
        stringstream ss(s);
        string token;
        while (getline(ss, token, ',')) {
            if (!token.empty()) nums.push_back(stoi(token));
        }
        int k = stoi(temp);
        Solution sol;
        cout << sol.findKthLargest(nums, k);
    }
    return 0;
}
`;
    } else if (titleNorm === 'contains duplicate' || titleNorm === 'two sum') {
      if (titleNorm === 'contains duplicate') {
        driver = `
int main() {
    string s;
    if (getline(cin, s)) {
        s.erase(remove(s.begin(), s.end(), '['), s.end());
        s.erase(remove(s.begin(), s.end(), ']'), s.end());
        vector<int> nums;
        stringstream ss(s);
        string token;
        while (getline(ss, token, ',')) {
            if (!token.empty()) nums.push_back(stoi(token));
        }
        Solution sol;
        cout << (sol.containsDuplicate(nums) ? "true" : "false");
    }
    return 0;
}
`;
      } else {
        driver = `
int main() {
    string s;
    if (getline(cin, s)) {
        s.erase(remove(s.begin(), s.end(), '['), s.end());
        s.erase(remove(s.begin(), s.end(), ']'), s.end());
        vector<int> nums;
        stringstream ss(s);
        string token;
        while (getline(ss, token, ',')) {
            if (!token.empty()) nums.push_back(stoi(token));
        }
        int target;
        if (cin >> target) {
            Solution sol;
            vector<int> res = sol.twoSum(nums, target);
            if (res.size() >= 2) {
                cout << "[" << res[0] << "," << res[1] << "]";
            }
        }
    }
    return 0;
}
`;
      }
    } else if (titleNorm === 'palindrome number') {
      driver = `
int main() {
    int x;
    if (cin >> x) {
        Solution sol;
        cout << (sol.isPalindrome(x) ? "true" : "false");
    }
    return 0;
}
`;
    } else {
      driver = generateDynamicCppDriver(code);
    }

    return `${header}\n${code}\n${driver}`;
  }
}
export default CppDriver;
