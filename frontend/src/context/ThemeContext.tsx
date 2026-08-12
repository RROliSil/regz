import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'padrao' | 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('regz_theme');
    if (saved === 'cloud') return 'dark';
    if (saved === 'light' || saved === 'dark' || saved === 'padrao') {
      return saved as ThemeMode;
    }
    return 'padrao'; // Modo Padrão (Dark Indigo Glassmorphism original)
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('regz_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const cycleTheme = () => {
    if (theme === 'padrao') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('padrao');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};
