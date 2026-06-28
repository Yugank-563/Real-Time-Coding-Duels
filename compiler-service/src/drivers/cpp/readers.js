// Merged module for readers

// Reader for bool parameters.
// Emits: string _bsN = _readLine(); bool _pN = (_bsN == "true");
 
export function readBool(varName, idx) {
  return `    string _bs${idx} = _readLine(); bool ${varName} = (_bs${idx} == "true");`;
}

// Reader for char parameters (non-vector).
// Emits: char _pN; cin >> _pN; cin.ignore();
 
export function readChar(varName) {
  return `    char ${varName}; cin >> ${varName}; cin.ignore();`;
}

// Reader for double/float parameters.
// Emits: double _pN; cin >> _pN; cin.ignore();
 
export function readDouble(varName) {
  return `    double ${varName}; cin >> ${varName}; cin.ignore();`;
}

// Reader for int parameters.
// Emits: int _pN; cin >> _pN; cin.ignore();
 
export function readInt(varName) {
  return `    int ${varName}; cin >> ${varName}; cin.ignore();`;
}

// Reader for ListNode structures.
// Builds a linked list from a comma-separated bracketed or plain string.
// Emits a multi-line inline C++ block that:
//  1. Reads a line
//  2. Strips brackets
//  3. Splits by comma and builds ListNode chain via dummy head
 
export function readListNode(varName) {
  return `    ListNode* ${varName} = nullptr;
    {
        string _ln_s = _readLine();
        if (!_ln_s.empty()) {
            _ln_s.erase(remove(_ln_s.begin(), _ln_s.end(), '['), _ln_s.end());
            _ln_s.erase(remove(_ln_s.begin(), _ln_s.end(), ']'), _ln_s.end());
            stringstream _ln_ss(_ln_s);
            string _ln_tok;
            ListNode* _ln_dummy = new ListNode(0);
            ListNode* _ln_curr = _ln_dummy;
            while (getline(_ln_ss, _ln_tok, ',')) {
                if (!_ln_tok.empty()) {
                    _ln_curr->next = new ListNode(stoi(_ln_tok));
                    _ln_curr = _ln_curr->next;
                }
            }
            ${varName} = _ln_dummy->next;
        }
    }`;
}

// Reader for long long parameters.
// Emits: long long _pN; cin >> _pN; cin.ignore();
 
export function readLongLong(varName) {
  return `    long long ${varName}; cin >> ${varName}; cin.ignore();`;
}

// Reader for string parameters.
// Emits: string _pN = _readLine();
 
export function readString(varName) {
  return `    string ${varName} = _readLine();`;
}

// Reader for TreeNode structures.
// Builds a binary tree from a level-order comma-separated string (with "null" markers).
// Emits a multi-line inline C++ block using the globally-available _buildTree helper
// which is emitted by the dynamic driver builder when TreeNode is detected.
 
export function readTreeNode(varName) {
  return `    TreeNode* ${varName} = nullptr;
    {
        string _tn_s = _readLine();
        if (!_tn_s.empty()) {
            _tn_s.erase(remove(_tn_s.begin(), _tn_s.end(), '['), _tn_s.end());
            _tn_s.erase(remove(_tn_s.begin(), _tn_s.end(), ']'), _tn_s.end());
            ${varName} = _buildTree(_tn_s);
        }
    }`;
}

// Reader for vector<char> parameters.
// Emits: auto _pN = _parseVC(_readLine());
 
export function readVectorChar(varName) {
  return `    auto ${varName} = _parseVC(_readLine());`;
}

// Reader for vector<int> parameters.
// Emits: auto _pN = _parseVI(_readLine());
 
export function readVectorInt(varName) {
  return `    auto ${varName} = _parseVI(_readLine());`;
}

// Reader for vector<string> parameters.
// Emits: auto _pN = _parseVS(_readLine());
 
export function readVectorString(varName) {
  return `    auto ${varName} = _parseVS(_readLine());`;
}

// Reader for vector<vector<char>> parameters.
// Emits: auto _pN = _parseVVC(_readLine());
// NOTE: _parseVVC is only available in drivers that include it (e.g. sudokuSolver exception).
// For future generic use, the builder must emit the _parseVVC helper too.
 
export function readVectorVectorChar(varName) {
  return `    auto ${varName} = _parseVVC(_readLine());`;
}

// Reader for vector<vector<int>> parameters.
// Emits: auto _pN = _parseVVI(_readLine());
 
export function readVectorVectorInt(varName) {
  return `    auto ${varName} = _parseVVI(_readLine());`;
}

