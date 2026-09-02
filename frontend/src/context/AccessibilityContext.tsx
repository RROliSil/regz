import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontScale = 'normal' | 'medium' | 'large' | 'xlarge';

export interface AccessibilitySettings {
  fontScale: FontScale;
  focusHighlight: boolean;
  largeClickables: boolean;
  dyslexicFont: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontScale: 'normal',
  focusHighlight: false,
  largeClickables: false,
  dyslexicFont: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('regz_accessibility_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Erro ao ler configurações de acessibilidade do localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('regz_accessibility_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('regz_accessibility_settings', JSON.stringify(DEFAULT_SETTINGS));
  };

  // Aplicar atributos no elemento raiz <html> para controle por CSS
  useEffect(() => {
    const root = document.documentElement;

    // Escala de Fonte
    root.setAttribute('data-font-scale', settings.fontScale);

    // Garantir remoção de alto contraste legado
    root.removeAttribute('data-high-contrast');

    // Foco Reforçado
    if (settings.focusHighlight) {
      root.setAttribute('data-focus-highlight', 'true');
    } else {
      root.removeAttribute('data-focus-highlight');
    }

    // Áreas de Clique e Ícones Ampliados
    if (settings.largeClickables) {
      root.setAttribute('data-large-clickables', 'true');
    } else {
      root.removeAttribute('data-large-clickables');
    }

    // Fonte para Dislexia
    if (settings.dyslexicFont) {
      root.setAttribute('data-dyslexic-font', 'true');
    } else {
      root.removeAttribute('data-dyslexic-font');
    }
  }, [settings]);

  // Suporte a atalho global de teclado (Alt + A) para abrir o módulo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsModalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility deve ser usado dentro de um AccessibilityProvider');
  }
  return context;
};
