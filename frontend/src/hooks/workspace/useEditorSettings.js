import { useState } from 'react';

export const useEditorSettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('bc-editor-settings-v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved editor settings:', e);
      }
    }
    return {
      fontSize: 16,
      tabSize: 4,
      wordWrap: 'off', // 'on' | 'off'
      lineNumbers: 'on', // 'on' | 'off'
      theme: 'vs-dark',
    };
  });

  const updateSettings = (newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('bc-editor-settings-v2', JSON.stringify(updated));
      return updated;
    });
  };

  return [settings, updateSettings];
};
