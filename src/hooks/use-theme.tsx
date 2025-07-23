import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palettes } from '../theme/palette';

export type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  palette: typeof palettes.light;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const THEME_KEY = 'user_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved);
      } else {
        setThemeState(systemScheme === 'dark' ? 'dark' : 'light');
      }
    })();
  }, [systemScheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    AsyncStorage.setItem(THEME_KEY, newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const palette = palettes[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, palette }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}; 