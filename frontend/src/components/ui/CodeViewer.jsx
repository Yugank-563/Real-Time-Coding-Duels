
const CodeViewer = ({ code, language }) => {
  return (
    <Editor
      height="100%"
      language={language === 'py' ? 'python' : language === 'js' ? 'javascript' : 'cpp'}
      value={code || '// No code available.'}
      theme="vs-dark"
      options={{
        readOnly: true,
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        padding: { top: 24, bottom: 24 },
        scrollbar: {
          vertical: 'visible',
          verticalScrollbarSize: 8,
          useShadows: true,
        },
        lineNumbers: 'on',
        lineHeight: 24,
      }}
    />
  );
};

export default CodeViewer;
