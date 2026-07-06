import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';


const MonacoEditorComponent = React.memo(({
  code,
  theme,
  onChange,
  onMount,
  settings,
}) => {
  const localRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    localRef.current = editor;
    if (onMount) onMount(editor, monaco);
    
    editor.onDidChangeModelContent(() => {
      const val = editor.getValue();
      onChange(val);
    });
  };

  // Prevent cursor jump when parent updates code (e.g. from template loading, formatting, etc.)
  useEffect(() => {
    if (localRef.current) {
      const currentVal = localRef.current.getValue();
      if (code !== currentVal) {
        localRef.current.setValue(code);
      }
    }
  }, [code]);

  return (
    <Editor
      height="100%"
      language="cpp"
      value={code}
      theme="vs-dark"
      onMount={handleEditorDidMount}
      options={{
        automaticLayout: true,
        fontSize: settings?.fontSize === 14 ? 16 : (settings?.fontSize || 16),
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        minimap: { enabled: false },
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          useShadows: false,
          verticalScrollbarSize: 5,
          horizontalScrollbarSize: 5,
        },
        fontLigatures: true,
        lineHeight: 26,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        contextmenu: false,
        padding: { top: 0, bottom: 14 },
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        accessibilitySupport: 'off',
        lineNumbers: settings?.lineNumbers || 'on',
        wordWrap: settings?.wordWrap || 'off',
        tabSize: settings?.tabSize || 4,
      }}
    />
  );
});

export default MonacoEditorComponent;
