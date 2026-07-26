// ── Static / Custom Execution Drivers ──

// ─── TRUE EXCEPTION: Linked List Cycle ───────────────────────────────────────
// Cannot be generalized because it requires mutating the pointer structure 
// after construction to form an actual cycle.
export function linkedListCycleDriver(_code) {
  return `
int main() {
    string s;
    int pos = -1;
    if (!getline(cin, s)) return 0;
    while (!s.empty() && (s.back() == '\\r' || s.back() == ' ')) s.pop_back();

    // Read pos from second line
    string posLine;
    if (getline(cin, posLine)) {
        while (!posLine.empty() && (posLine.back() == '\\r' || posLine.back() == ' ')) posLine.pop_back();
        if (!posLine.empty()) {
            try { pos = stoi(posLine); } catch(...) { pos = -1; }
        }
    }

    // Strip brackets and build node list
    s.erase(remove(s.begin(), s.end(), '['), s.end());
    s.erase(remove(s.begin(), s.end(), ']'), s.end());

    vector<ListNode*> nodes;
    if (!s.empty()) {
        stringstream ss(s);
        string token;
        while (getline(ss, token, ',')) {
            while (!token.empty() && isspace((unsigned char)token.front())) token.erase(token.begin());
            while (!token.empty() && isspace((unsigned char)token.back()))  token.pop_back();
            if (!token.empty()) {
                try { nodes.push_back(new ListNode(stoi(token))); } catch(...) {}
            }
        }
    }

    // Link nodes linearly
    for (int i = 0; i + 1 < (int)nodes.size(); i++) {
        nodes[i]->next = nodes[i + 1];
    }

    // Connect tail to nodes[pos] to form the cycle (pos == -1 means no cycle)
    if (!nodes.empty() && pos >= 0 && pos < (int)nodes.size()) {
        nodes.back()->next = nodes[pos];
    }

    ListNode* head = nodes.empty() ? nullptr : nodes[0];
    Solution sol;
    cout << (sol.hasCycle(head) ? "true" : "false");
    return 0;
}
`;
}

// ─── TRUE EXCEPTION: Reorder List ────────────────────────────────────────────
// Cannot be generalized because the method is void but mutates a ListNode* 
// in-place, requiring a custom traversal to print the result.
export function reorderListDriver(_code) {
  return `
int main() {
    string s;
    if (!getline(cin, s)) return 0;
    while (!s.empty() && (s.back() == '\\r' || s.back() == ' ')) s.pop_back();

    s.erase(remove(s.begin(), s.end(), '['), s.end());
    s.erase(remove(s.begin(), s.end(), ']'), s.end());

    ListNode* dummy = new ListNode(0);
    ListNode* curr = dummy;
    if (!s.empty()) {
        stringstream ss(s);
        string token;
        while (getline(ss, token, ',')) {
            while (!token.empty() && isspace((unsigned char)token.front())) token.erase(token.begin());
            while (!token.empty() && isspace((unsigned char)token.back()))  token.pop_back();
            if (!token.empty()) {
                try { curr->next = new ListNode(stoi(token)); curr = curr->next; } catch(...) {}
            }
        }
    }

    ListNode* head = dummy->next;
    Solution sol;
    sol.reorderList(head);

    // Print the reordered list
    string out = "";
    while (head) {
        out += to_string(head->val);
        if (head->next) out += ",";
        head = head->next;
    }
    cout << "[" << out << "]";
    return 0;
}
`;
}

// ─── TRUE EXCEPTION: Sudoku Solver ───────────────────────────────────────────
// Cannot be generalized because it takes a 2D quoted-char grid (VVC) and 
// mutates it in place with no return value.
export function sudokuSolverDriver(_code) {
  return `
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
}

int main() {
    string s;
    if (getline(cin, s)) {
        vector<vector<char>> board = _parseVVC(s);
        Solution sol;
        sol.solveSudoku(board);
        cout << _printVVC(board);
    }
    return 0;
}
`;
}

// Legacy C++ Drivers for specific hardcoded problems
// Mapped by normalized problem title

const listNodeDef = `
#pragma GCC diagnostic error "-Wreturn-type"
#include <bits/stdc++.h>

using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};
`;

const treeNodeDef = `
#pragma GCC diagnostic error "-Wreturn-type"
#include <bits/stdc++.h>

using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};
`;

const standardImports = `
#pragma GCC diagnostic error "-Wreturn-type"
#include <bits/stdc++.h>

using namespace std;
`;

export function getLegacyHeader(titleNorm) {
  if (titleNorm === 'reverse linked list') return listNodeDef;
  if (titleNorm === 'invert binary tree') return treeNodeDef;
  return standardImports;
}

export const LEGACY_DRIVERS = {
  'reverse words in a string': () => `
int main() {
    string s;
    if (getline(cin, s)) {
        Solution sol;
        cout << sol.reverseWords(s);
    }
    return 0;
}
`,

  'reverse linked list': () => `
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
`,

  'valid parentheses': () => `
int main() {
    string s;
    if (getline(cin, s)) {
        Solution sol;
        cout << (sol.isValid(s) ? "true" : "false");
    }
    return 0;
}
`,

  'invert binary tree': () => `
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
`,

  'climbing stairs': () => `
int main() {
    int n;
    if (cin >> n) {
        Solution sol;
        cout << sol.climbStairs(n);
    }
    return 0;
}
`,

  'subsets': () => `
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
        cout << "[" << out << "]";
    }
    return 0;
}
`,

  'merge sorted array': () => `
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
`,

  'jump game': () => `
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
`,

  'single number': () => `
int main() {
    string s;
    if (getline(cin, s)) {
        vector<int> nums;
        if (s.find('[') != string::npos || s.find(',') != string::npos) {
            s.erase(remove(s.begin(), s.end(), '['), s.end());
            s.erase(remove(s.begin(), s.end(), ']'), s.end());
            stringstream ss(s);
            string token;
            while (getline(ss, token, ',')) {
                if (!token.empty()) nums.push_back(stoi(token));
            }
        } else {
            int n = stoi(s);
            int val;
            while (n-- > 0 && cin >> val) {
                nums.push_back(val);
            }
        }
        Solution sol;
        cout << sol.singleNumber(nums);
    }
    return 0;
}
`,

  'fizz buzz': () => `
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
        cout << "[" << out << "]";
    }
    return 0;
}
`,

  'max consecutive ones iii': () => `
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
`,

  'valid palindrome': () => `
int main() {
    string s;
    if (getline(cin, s)) {
        Solution sol;
        cout << (sol.isPalindrome(s) ? "true" : "false");
    }
    return 0;
}
`,

  'binary search': () => `
int main() {
    string s;
    if (getline(cin, s)) {
        vector<int> nums;
        int target;
        if (s.find('[') != string::npos || s.find(',') != string::npos) {
            s.erase(remove(s.begin(), s.end(), '['), s.end());
            s.erase(remove(s.begin(), s.end(), ']'), s.end());
            stringstream ss(s);
            string token;
            while (getline(ss, token, ',')) {
                if (!token.empty()) nums.push_back(stoi(token));
            }
            string temp;
            if (getline(cin, temp)) {
                target = stoi(temp);
            }
        } else {
            stringstream ss(s);
            int n;
            ss >> n;
            bool target_read = (bool)(ss >> target);
            int val;
            while (n-- > 0 && cin >> val) {
                nums.push_back(val);
            }
            if (!target_read) cin >> target;
        }
        Solution sol;
        cout << sol.search(nums, target);
    }
    return 0;
}
`,

  'kth largest element in an array': () => `
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
`,

  'contains duplicate': () => `
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
`,

  'two sum': () => `
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
`,

  'palindrome number': () => `
int main() {
    int x;
    if (cin >> x) {
        Solution sol;
        cout << (sol.isPalindrome(x) ? "true" : "false");
    }
    return 0;
}
`,

  'sudoku solver': () => `
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
}

int main() {
    string s;
    if (getline(cin, s)) {
        vector<vector<char>> board = _parseVVC(s);
        Solution sol;
        sol.solveSudoku(board);
        cout << _printVVC(board);
    }
    return 0;
}
`
};
