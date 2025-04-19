import { useEffect, useState } from 'react';
import { useColorScheme as _useColorScheme } from 'react-native';

// Hook for watching system color scheme changes
export default function useColorScheme(): 'light' | 'dark' {
  const colorScheme = _useColorScheme() as 'light' | 'dark';
  const [currentScheme, setCurrentScheme] = useState<'light' | 'dark'>(colorScheme || 'light');

  useEffect(() => {
    setCurrentScheme(colorScheme || 'light');
  }, [colorScheme]);

  return currentScheme;
}