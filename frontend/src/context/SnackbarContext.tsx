import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

interface SnackbarItem {
  id: number;
  message: string;
  type: SnackbarType;
}

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([]);

  const removeSnackbar = useCallback((id: number) => {
    setSnackbars((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showSnackbar = useCallback((message: string, type: SnackbarType = 'success') => {
    const id = Date.now() + Math.random();
    setSnackbars((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeSnackbar(id);
    }, 3500);
  }, [removeSnackbar]);

  const getIcon = (type: SnackbarType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} color="#34d399" style={{ flexShrink: 0 }} />;
      case 'error':
        return <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0 }} />;
      case 'warning':
        return <AlertTriangle size={20} color="#fbbf24" style={{ flexShrink: 0 }} />;
      case 'info':
      default:
        return <Info size={20} color="#38bdf8" style={{ flexShrink: 0 }} />;
    }
  };

  const getBorderColor = (type: SnackbarType) => {
    switch (type) {
      case 'success': return 'rgba(52, 211, 153, 0.45)';
      case 'error': return 'rgba(248, 113, 113, 0.45)';
      case 'warning': return 'rgba(251, 191, 36, 0.45)';
      case 'info':
      default:
        return 'rgba(56, 189, 248, 0.45)';
    }
  };

  const getGlowShadow = (type: SnackbarType) => {
    switch (type) {
      case 'success': return '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(52, 211, 153, 0.25)';
      case 'error': return '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(248, 113, 113, 0.25)';
      case 'warning': return '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(251, 191, 36, 0.25)';
      case 'info':
      default:
        return '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.25)';
    }
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      
      {/* Contêiner Flutuante de Snackbars (Canto Inferior Direito) */}
      <div
        className="snackbar-container"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
          maxWidth: '420px',
          width: 'calc(100vw - 48px)'
        }}
      >
        {snackbars.map((item) => (
          <div
            key={item.id}
            className="snackbar-toast"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: `1px solid ${getBorderColor(item.type)}`,
              padding: '14px 18px',
              borderRadius: '14px',
              boxShadow: getGlowShadow(item.type),
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 600,
              animation: 'slideInSnackbar 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              {getIcon(item.type)}
              <span style={{ wordBreak: 'break-word', color: '#f8fafc', lineHeight: 1.4 }}>
                {item.message}
              </span>
            </div>

            <button
              onClick={() => removeSnackbar(item.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ffffff'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255, 255, 255, 0.5)'; }}
              title="Fechar notificação"
            >
              <X size={16} />
            </button>

            {/* Barra de Progresso do Tempo de Exibição */}
            <div
              className="snackbar-timer-bar"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '3px',
                background: item.type === 'success' ? '#34d399' : item.type === 'error' ? '#f87171' : item.type === 'warning' ? '#fbbf24' : '#38bdf8',
                width: '100%',
                animation: 'shrinkTimer 3.5s linear forwards'
              }}
            />
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar deve ser usado dentro de um SnackbarProvider');
  }
  return context;
};
