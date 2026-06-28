// Merged module for printers

// Printer for bool return type.
// Emits: cout << (call ? "true" : "false");
 
export function printBool(callExpr) {
  return `    cout << (${callExpr} ? "true" : "false");`;
}

// Printer for char return type.
// Emits: cout << call;
 
export function printChar(callExpr) {
  return `    cout << ${callExpr};`;
}

// Printer for double return type.
// Emits: cout << call;
 
export function printDouble(callExpr) {
  return `    cout << ${callExpr};`;
}

// Printer for int return type.
// Emits: cout << call;
 
export function printInt(callExpr) {
  return `    cout << ${callExpr};`;
}

// Printer for ListNode structures.
// The generated C++ traverses the result linked list and prints
// comma-separated values wrapped in brackets (matching input format).
 
export function printListNode(callExpr) {
  return `    {
        ListNode* _ln_res = ${callExpr};
        string _ln_out = "";
        while (_ln_res) {
            _ln_out += to_string(_ln_res->val) + ",";
            _ln_res = _ln_res->next;
        }
        if (!_ln_out.empty()) _ln_out.pop_back();
        cout << "[" << _ln_out << "]";
    }`;
}

// Printer for long long return type.
// Emits: cout << call;
 
export function printLongLong(callExpr) {
  return `    cout << ${callExpr};`;
}

// Printer for string return type.
// Emits: cout << call;
 
export function printString(callExpr) {
  return `    cout << ${callExpr};`;
}

// Printer for TreeNode structures.
// The generated C++ uses the _serializeTree helper (emitted by the dynamic
// driver builder when TreeNode is detected) to level-order serialize
// the tree, then prints it wrapped in brackets.
 
export function printTreeNode(callExpr) {
  return `    {
        TreeNode* _tn_res = ${callExpr};
        string _tn_out = _serializeTree(_tn_res);
        cout << "[" << _tn_out << "]";
    }`;
}

// Printer for vector<char> return type.
// Emits: auto _r = call; cout << _printVC(_r);
 
export function printVectorChar(callExpr) {
  return `    auto _r = ${callExpr};\n    cout << _printVC(_r);`;
}

// Printer for vector<int> return type.
// Emits: auto _r = call; cout << _printVI(_r);
 
export function printVectorInt(callExpr) {
  return `    auto _r = ${callExpr};\n    cout << _printVI(_r);`;
}

// Printer for vector<string> return type.
// Emits: auto _r = call; cout << _printVS(_r);
 
export function printVectorString(callExpr) {
  return `    auto _r = ${callExpr};\n    cout << _printVS(_r);`;
}

// Printer for vector<vector<char>> return type.
// Uses a _printVVC helper (emitted inline by the driver when this type is used).
// Emits: auto _r = call; cout << _printVVC(_r);
 
export function printVectorVectorChar(callExpr) {
  return `    auto _r = ${callExpr};\n    cout << _printVVC(_r);`;
}

// Printer for vector<vector<int>> return type.
// Emits: auto _r = call; cout << _printVVI(_r);
 
export function printVectorVectorInt(callExpr) {
  return `    auto _r = ${callExpr};\n    cout << _printVVI(_r);`;
}

// Printer for void return type — mutated parameter strategy.
// Handles void return types by detecting which parameter was mutated.
// Priority order for detecting the mutated param:
//   1. matrix (vector<vector<int>>) → _printVVI
//   2. vector<int>                  → _printVI
//   3. vector<char>                 → _printVC
//   4. vector<string>               → _printVS
//   5. nothing printable            → just execute the call
// @param {string}   callExpr  - The full sol.method(...) call expression
// @param {string[]} params    - Array of raw C++ parameter declaration strings
// @param {string[]} callArgs  - Array of variable names matching params (e.g. _p0, _p1)
// @returns {string} - C++ statement(s) for the void case
 
export function printVoidMutatedParam(callExpr, params, callArgs) {
  const matIdx    = params.findIndex(p => /vector\s*<\s*vector/i.test(p));
  const vecIntIdx = params.findIndex(p => /vector\s*<\s*int/i.test(p));
  const vecCharIdx= params.findIndex(p => /vector\s*<\s*char/i.test(p));
  const vecStrIdx = params.findIndex(p => /vector\s*<\s*string/i.test(p));

  if (matIdx !== -1) {
    return `    ${callExpr};\n    cout << _printVVI(${callArgs[matIdx]});`;
  } else if (vecIntIdx !== -1) {
    return `    ${callExpr};\n    cout << _printVI(${callArgs[vecIntIdx]});`;
  } else if (vecCharIdx !== -1) {
    return `    ${callExpr};\n    cout << _printVC(${callArgs[vecCharIdx]});`;
  } else if (vecStrIdx !== -1) {
    return `    ${callExpr};\n    cout << _printVS(${callArgs[vecStrIdx]});`;
  } else {
    return `    ${callExpr};`;
  }
}

