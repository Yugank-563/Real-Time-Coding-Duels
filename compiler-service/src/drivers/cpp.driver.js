import BaseDriver from './base.driver.js';

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
        cout << out;
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
        TreeNode* root = buildTree(s);
        Solution sol;
        TreeNode* inverted = sol.invertTree(root);
        cout << serialize(inverted);
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
        m = stoi(temp);
        vector<int> nums1;
        stringstream ss1(s1);
        string token;
        while (getline(ss1, token, ',')) {
            if (!token.empty()) nums1.push_back(stoi(token));
        }
        if (getline(cin, s2) && getline(cin, temp)) {
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
            cout << out;
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
                cout << res[0] << "," << res[1];
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
      driver = `
int main() {
    return 0;
}
`;
    }

    return `${header}\n${code}\n${driver}`;
  }
}
export default CppDriver;
