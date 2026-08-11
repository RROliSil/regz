import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, AuthContextType, PermissoesAba } from '../types/auth';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('regz_token'));
  const [loading, setLoading] = useState(true);

  // Validar token no carregamento da aplicação
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('regz_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` }
        });

        if (res.ok) {
          const data = await res.json();
          setUsuario(data.usuario);
          setToken(savedToken);
        } else {
          localStorage.removeItem('regz_token');
          setUsuario(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Falha ao efetuar login' };
      }

      localStorage.setItem('regz_token', data.token);
      setToken(data.token);
      setUsuario(data.usuario);

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  const logout = () => {
    localStorage.removeItem('regz_token');
    setToken(null);
    setUsuario(null);
  };

  const temPermissao = (aba: keyof PermissoesAba, nivelExigido: 'leitura' | 'escrita' = 'leitura'): boolean => {
    if (!usuario || !usuario.perfil) return false;
    
    // Administrador possui acesso total a tudo
    if (usuario.perfil.is_admin) return true;

    const nivelAba = usuario.perfil.permissoes?.[aba] || 'sem_acesso';

    if (nivelAba === 'sem_acesso') return false;
    if (nivelExigido === 'leitura') return nivelAba === 'leitura' || nivelAba === 'escrita';
    if (nivelExigido === 'escrita') return nivelAba === 'escrita';

    return false;
  };

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout, temPermissao }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
