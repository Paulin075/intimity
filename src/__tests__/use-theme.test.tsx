import { renderHook, act } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../hooks/use-theme';
import React from 'react';

// Exemple de test unitaire pour le hook use-theme

describe('useTheme', () => {
  it('permet de changer le thème', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('light');
    act(() => {
      result.current.setTheme('dark');
    });
    expect(result.current.theme).toBe('dark');
  });
}); 