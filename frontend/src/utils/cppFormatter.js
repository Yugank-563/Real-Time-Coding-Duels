export const formatCppCode = (rawCode) => {
  const formatLineSpacing = (ln) => {
    if (ln.startsWith('#') || ln.startsWith('//') || ln.startsWith('/*')) {
      return ln;
    }

    // 1. Temporarily protect C++ template definitions
    ln = ln.replace(/\b(vector|map|set|pair|unordered_map|unordered_set|stack|queue|priority_queue|list|tuple|array|shared_ptr|unique_ptr|make_shared|make_unique)\s*</g, '$1___T_OPEN___');
    
    // Protect pointer arrows ->
    ln = ln.replace(/->/g, '___ARROW___');
    
    // Protect scope resolution operator ::
    ln = ln.replace(/::/g, '___SCOPE___');

    // 2. Ensure space before return or control structures if preceded by non-space
    ln = ln.replace(/([^\s])\b(return|if|for|while|switch)\b/g, '$1 $2');

    // Ensure space after control structures: if, for, while, switch, catch
    ln = ln.replace(/\b(if|for|while|switch|catch)\s*\(/g, '$1 (');

    // Ensure space after return keyword before opening braces, parenthesis, variables
    ln = ln.replace(/\breturn\s*(\{)/g, 'return {');
    ln = ln.replace(/\breturn\s*(\()/g, 'return (');
    ln = ln.replace(/\breturn\s*([a-zA-Z0-9_"'])/g, 'return $1');

    // 3. Ensure space after commas
    ln = ln.replace(/,([^\s])/g, ', $1');

    // 4. Space all standard binary C++ arithmetic operators (+, -, *, /, %) safely
    ln = ln.replace(/([a-zA-Z0-9_\]\)])\s*([+\-*/%])\s*([a-zA-Z0-9_\(\[])/g, '$1 $2 $3');

    // Space comparison operators safely
    ln = ln.replace(/([a-zA-Z0-9_\]\)])\s*(<|>)\s*([a-zA-Z0-9_\(\[])/g, '$1 $2 $3');

    // Space compound operators safely using placeholders
    ln = ln.replace(/==/g, '___EQ___');
    ln = ln.replace(/\+=/g, '___ADD___');
    ln = ln.replace(/-=/g, '___SUB___');
    ln = ln.replace(/\*=/g, '___MUL___');
    ln = ln.replace(/\/=/g, '___DIV___');
    ln = ln.replace(/!=/g, '___NEQ___');
    ln = ln.replace(/<=/g, '___LTE___');
    ln = ln.replace(/>=/g, '___GTE___');
    ln = ln.replace(/&&/g, '___AND___');
    ln = ln.replace(/\|\|/g, '___OR___');

    // Space single '='
    ln = ln.replace(/\s*=\s*/g, ' = ');

    // Restore placeholders
    ln = ln.replace(/___EQ___/g, ' == ');
    ln = ln.replace(/___ADD___/g, ' += ');
    ln = ln.replace(/___SUB___/g, ' -= ');
    ln = ln.replace(/___MUL___/g, ' *= ');
    ln = ln.replace(/___DIV___/g, ' /= ');
    ln = ln.replace(/___NEQ___/g, ' != ');
    ln = ln.replace(/___LTE___/g, ' <= ');
    ln = ln.replace(/___GTE___/g, ' >= ');
    ln = ln.replace(/___AND___/g, ' && ');
    ln = ln.replace(/___OR___/g, ' || ');

    // 5. Space ternary `:` operator
    ln = ln.replace(/\s*:\s*/g, ' : ');
    ln = ln.replace(/\b(public|private|protected|default)\s*:\s*/g, '$1: ');
    ln = ln.replace(/\b(case\s+[a-zA-Z0-9_'"\-+\*\/]+)\s*:\s*/g, '$1: ');

    // Ensure space after semicolons
    ln = ln.replace(/;([^\s])/g, '; $1');

    // 6. Restore template brackets, arrows, and scopes
    ln = ln.replace(/___T_OPEN___/g, '<');
    ln = ln.replace(/___ARROW___/g, '->');
    ln = ln.replace(/___SCOPE___/g, '::');

    // 7. Clean up multiple spaces
    ln = ln.replace(/ {2,}/g, ' ');

    // 8. Correct trailing semicolon spacing
    ln = ln.replace(/\s+;/g, ';');

    return ln;
  };

  const lines = rawCode.split('\n');
  let indentLevel = 0;
  const indentSize = 4;
  const formattedLines = [];
  let nextLineExtraIndent = false;

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    let line = originalLine.trim();

    if (!line) {
      formattedLines.push('');
      continue;
    }

    line = formatLineSpacing(line);

    const cleanLine = line
      .replace(/\/\/.*/, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/"(\\.|[^"\\])*"/g, '""')
      .replace(/'(\\.|[^'\\])*'/g, "''");

    let openBraces = (cleanLine.match(/\{/g) || []).length;
    let closeBraces = (cleanLine.match(/\}/g) || []).length;

    const leadingClosesMatch = cleanLine.match(/^(\})+/);
    const leadingClosesCount = leadingClosesMatch ? leadingClosesMatch[0].length : 0;

    let currentIndent = Math.max(0, indentLevel - leadingClosesCount);

    if (nextLineExtraIndent) {
      currentIndent += 1;
    }

    let isAccessSpecifier = /^(public|private|protected)\s*:/.test(cleanLine);
    if (isAccessSpecifier) {
      currentIndent = Math.max(0, currentIndent - 0.5);
    }

    const indentation = ' '.repeat(Math.round(currentIndent * indentSize));
    formattedLines.push(indentation + line);

    nextLineExtraIndent = false;

    const isUnbracedControl = /\b(if|for|while|else)\b/.test(cleanLine) && 
                              !cleanLine.endsWith('{') && 
                              !cleanLine.endsWith(';');
    if (isUnbracedControl) {
      nextLineExtraIndent = true;
    }

    indentLevel = Math.max(0, indentLevel + openBraces - closeBraces);
  }

  return formattedLines.join('\n');
};
