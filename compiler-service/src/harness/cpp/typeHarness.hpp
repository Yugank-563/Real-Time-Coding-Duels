#ifndef TYPE_HARNESS_HPP
#define TYPE_HARNESS_HPP

#pragma GCC diagnostic error "-Wreturn-type"
#include <bits/stdc++.h>

using namespace std;

// ─── Data Structure Definitions ──────────────────────────────────────────────

#ifndef LISTNODE_DEF
#define LISTNODE_DEF
struct ListNode {
    int val;
    ListNode* next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode* next) : val(x), next(next) {}
};
#endif

#ifndef TREENODE_DEF
#define TREENODE_DEF
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode* left, TreeNode* right) : val(x), left(left), right(right) {}
};
#endif

// ─── Stream & String Helpers ──────────────────────────────────────────────────

inline string _readLine() {
    string line;
    if (!getline(cin, line)) return "";
    while (!line.empty() && (line.back() == '\r' || line.back() == '\n')) {
        line.pop_back();
    }
    return line;
}

inline string _escapeStr(const string& s) {
    string res;
    for (char c : s) {
        if (c == '"') res += "\\\"";
        else if (c == '\\') res += "\\\\";
        else res += c;
    }
    return res;
}

// ─── Recursive Serializer Overloads (_serialize) ──────────────────────────────

// Forward declarations
template<typename T>
string _serialize(const vector<T>& vec);

inline string _serialize(int val) { return to_string(val); }
inline string _serialize(long long val) { return to_string(val); }
inline string _serialize(double val) {
    ostringstream ss;
    ss << val;
    return ss.str();
}
inline string _serialize(float val) {
    ostringstream ss;
    ss << val;
    return ss.str();
}
inline string _serialize(bool val) { return val ? "true" : "false"; }
inline string _serialize(char val) { return string("\"") + _escapeStr(string(1, val)) + "\""; }
inline string _serialize(const string& val) { return string("\"") + _escapeStr(val) + "\""; }
inline string _serialize(const char* val) { return string("\"") + _escapeStr(string(val)) + "\""; }

// ListNode Serializer
inline string _serialize(ListNode* head) {
    string res = "[";
    ListNode* curr = head;
    while (curr) {
        res += to_string(curr->val);
        if (curr->next) res += ",";
        curr = curr->next;
    }
    return res + "]";
}

// TreeNode Serializer
inline string _serialize(TreeNode* root) {
    if (!root) return "[]";
    vector<string> vals;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front();
        q.pop();
        if (curr) {
            vals.push_back(to_string(curr->val));
            q.push(curr->left);
            q.push(curr->right);
        } else {
            vals.push_back("null");
        }
    }
    while (!vals.empty() && vals.back() == "null") {
        vals.pop_back();
    }
    string res = "[";
    for (size_t i = 0; i < vals.size(); i++) {
        res += vals[i];
        if (i + 1 < vals.size()) res += ",";
    }
    return res + "]";
}

// Recursive Vector Serializer (Handles 1D, 2D, 3D, N-D vectors!)
template<typename T>
string _serialize(const vector<T>& vec) {
    string res = "[";
    for (size_t i = 0; i < vec.size(); i++) {
        res += _serialize(vec[i]);
        if (i + 1 < vec.size()) res += ",";
    }
    return res + "]";
}

// ─── Deserializer Engine (_deserialize<T>) ────────────────────────────────────

template<typename T>
struct _TypeDeserializer;

template<typename T>
inline T _deserialize(const string& s) {
    return _TypeDeserializer<T>::parse(s);
}

// Primitive Deserializers
template<>
struct _TypeDeserializer<int> {
    static int parse(const string& s) {
        if (s.empty()) return 0;
        try { return stoi(s); } catch(...) { return 0; }
    }
};

template<>
struct _TypeDeserializer<long long> {
    static long long parse(const string& s) {
        if (s.empty()) return 0LL;
        try { return stoll(s); } catch(...) { return 0LL; }
    }
};

template<>
struct _TypeDeserializer<double> {
    static double parse(const string& s) {
        if (s.empty()) return 0.0;
        try { return stod(s); } catch(...) { return 0.0; }
    }
};

template<>
struct _TypeDeserializer<float> {
    static float parse(const string& s) {
        if (s.empty()) return 0.0f;
        try { return stof(s); } catch(...) { return 0.0f; }
    }
};

template<>
struct _TypeDeserializer<bool> {
    static bool parse(const string& s) {
        string str = s;
        transform(str.begin(), str.end(), str.begin(), ::tolower);
        return (str == "true" || str == "1");
    }
};

template<>
struct _TypeDeserializer<char> {
    static char parse(const string& s) {
        for (char c : s) {
            if (c != '"' && c != '\'' && c != ' ') return c;
        }
        return '\0';
    }
};

template<>
struct _TypeDeserializer<string> {
    static string parse(const string& s) {
        string res = s;
        if (!res.empty() && res.front() == '"') res.erase(0, 1);
        if (!res.empty() && res.back() == '"') res.pop_back();
        return res;
    }
};

// Generic Vector Splitter Helper
inline vector<string> _splitBracketedElements(const string& s) {
    vector<string> elems;
    if (s.empty()) return elems;
    int i = 0;
    while (i < (int)s.length() && s[i] != '[') i++;
    if (i >= (int)s.length()) return elems;
    i++; // skip outer [
    while (i < (int)s.length()) {
        while (i < (int)s.length() && (s[i] == ' ' || s[i] == ',' || s[i] == '\r' || s[i] == '\n')) i++;
        if (i >= (int)s.length() || s[i] == ']') break;
        if (s[i] == '[') {
            int start = i;
            int depth = 0;
            while (i < (int)s.length()) {
                if (s[i] == '[') depth++;
                else if (s[i] == ']') {
                    depth--;
                    if (depth == 0) { i++; break; }
                }
                i++;
            }
            elems.push_back(s.substr(start, i - start));
        } else if (s[i] == '"') {
            int start = i;
            i++; // skip opening "
            while (i < (int)s.length()) {
                if (s[i] == '\\') { i += 2; continue; }
                if (s[i] == '"') { i++; break; }
                i++;
            }
            elems.push_back(s.substr(start, i - start));
        } else {
            int start = i;
            while (i < (int)s.length() && s[i] != ',' && s[i] != ']' && s[i] != ' ') i++;
            elems.push_back(s.substr(start, i - start));
        }
    }
    return elems;
}

// Vector Deserializer Template
template<typename T>
struct _TypeDeserializer<vector<T>> {
    static vector<T> parse(const string& s) {
        vector<T> res;
        vector<string> rawTokens = _splitBracketedElements(s);
        for (const string& tok : rawTokens) {
            if (!tok.empty()) {
                res.push_back(_deserialize<T>(tok));
            }
        }
        return res;
    }
};

// ListNode Deserializer
template<>
struct _TypeDeserializer<ListNode*> {
    static ListNode* parse(const string& s) {
        string str = s;
        str.erase(remove(str.begin(), str.end(), '['), str.end());
        str.erase(remove(str.begin(), str.end(), ']'), str.end());
        if (str.empty()) return nullptr;
        stringstream ss(str);
        string tok;
        ListNode dummy(0);
        ListNode* curr = &dummy;
        while (getline(ss, tok, ',')) {
            while (!tok.empty() && isspace((unsigned char)tok.front())) tok.erase(tok.begin());
            while (!tok.empty() && isspace((unsigned char)tok.back())) tok.pop_back();
            if (!tok.empty()) {
                try {
                    curr->next = new ListNode(stoi(tok));
                    curr = curr->next;
                } catch(...) {}
            }
        }
        return dummy.next;
    }
};

// TreeNode Deserializer
template<>
struct _TypeDeserializer<TreeNode*> {
    static TreeNode* parse(const string& s) {
        string str = s;
        str.erase(remove(str.begin(), str.end(), '['), str.end());
        str.erase(remove(str.begin(), str.end(), ']'), str.end());
        if (str.empty()) return nullptr;
        vector<string> nodes;
        stringstream ss(str);
        string tok;
        while (getline(ss, tok, ',')) {
            while (!tok.empty() && isspace((unsigned char)tok.front())) tok.erase(tok.begin());
            while (!tok.empty() && isspace((unsigned char)tok.back())) tok.pop_back();
            nodes.push_back(tok);
        }
        if (nodes.empty() || nodes[0] == "null" || nodes[0].empty()) return nullptr;
        TreeNode* root = new TreeNode(stoi(nodes[0]));
        queue<TreeNode*> q;
        q.push(root);
        size_t i = 1;
        while (!q.empty() && i < nodes.size()) {
            TreeNode* curr = q.front();
            q.pop();
            if (i < nodes.size() && !nodes[i].empty() && nodes[i] != "null") {
                try {
                    curr->left = new TreeNode(stoi(nodes[i]));
                    q.push(curr->left);
                } catch(...) {}
            }
            i++;
            if (i < nodes.size() && !nodes[i].empty() && nodes[i] != "null") {
                try {
                    curr->right = new TreeNode(stoi(nodes[i]));
                    q.push(curr->right);
                } catch(...) {}
            }
            i++;
        }
        return root;
    }
};

#endif // TYPE_HARNESS_HPP
