import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, Mail, Loader2, AlertCircle, AlertTriangle, Sun, Moon, Palette, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const [rememberEmail, setRememberEmail] = useState(() => {
    return localStorage.getItem('regz_remember_email_enabled') === 'true';
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('regz_remembered_email') || '';
  });
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !senha) {
      setErrorMsg('Informe o e-mail e a senha.');
      return;
    }

    if (rememberEmail) {
      localStorage.setItem('regz_remembered_email', email.trim());
      localStorage.setItem('regz_remember_email_enabled', 'true');
    } else {
      localStorage.removeItem('regz_remembered_email');
      localStorage.removeItem('regz_remember_email_enabled');
    }

    setLoading(true);
    const result = await login(email.trim(), senha);
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Credenciais inválidas');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun size={18} />;
      case 'dark': return <Moon size={18} />;
      default: return <Palette size={18} />;
    }
  };

  const getThemeTitle = () => {
    switch (theme) {
      case 'light': return 'Modo Claro Ativo (Clique para alternar)';
      case 'dark': return 'Modo Escuro Ativo (Clique para alternar)';
      default: return 'Modo Padrão Regz (Clique para alternar)';
    }
  };

  return (
    <div className="login-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-gradient)',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Botão Flutuante de Alternância de Tema no Login */}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 100 }}>
        <button
          onClick={cycleTheme}
          className="theme-toggle-btn login-theme-btn"
          title={getThemeTitle()}
          style={{ width: '40px', height: '40px', borderRadius: '12px' }}
        >
          {getThemeIcon()}
        </button>
      </div>

      <div className="glass-panel login-card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '36px',
        borderRadius: '24px',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)'
      }}>
        {/* Header do Card Login */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.45)',
            marginBottom: '16px',
            overflow: 'hidden',
            background: 'transparent'
          }}>
            <video
              src="/videos/RegzICO.mp4"
              autoPlay
              muted
              playsInline
              poster="/videos/poster_start.png"
              onEnded={(e) => {
                const v = e.currentTarget;
                v.pause();
                if (v.duration) v.currentTime = v.duration;
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            >
              <img src="/logo.png" alt="Regz Gestão de Pessoas" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </video>
          </div>
          <h1 className="login-title" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Regz <span className="text-gradient">Gestão</span>
          </h1>
        </div>

        {errorMsg && (
          <div className="alert-danger" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="login-label" style={{ color: 'var(--text-main)', fontSize: '0.88rem', fontWeight: 600 }}>E-mail de Acesso</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="seu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="login-input"
                style={{ paddingLeft: '42px' }}
                required
              />
              <Mail size={18} className="login-input-icon" color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="login-label" style={{ color: 'var(--text-main)', fontSize: '0.88rem', fontWeight: 600 }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => setCapsLockActive(e.getModifierState('CapsLock'))}
                onKeyUp={(e) => setCapsLockActive(e.getModifierState('CapsLock'))}
                onBlur={() => setCapsLockActive(false)}
                disabled={loading}
                className="login-input"
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
                required
              />
              <Lock size={18} className="login-input-icon" color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  borderRadius: '6px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {capsLockActive && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                color: '#f59e0b',
                marginTop: '6px',
                fontWeight: 500
              }}>
                <AlertTriangle size={14} /> Caps Lock está ativado
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-4px' }}>
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '0.84rem',
              color: 'var(--text-muted)',
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                className="login-checkbox"
                checked={rememberEmail}
                onChange={(e) => {
                  setRememberEmail(e.target.checked);
                  if (!e.target.checked) {
                    localStorage.removeItem('regz_remembered_email');
                    localStorage.removeItem('regz_remember_email_enabled');
                  }
                }}
              />
              <span>Lembrar meu e-mail</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              justifyContent: 'center',
              padding: '14px',
              fontSize: '1rem',
              borderRadius: '14px',
              marginTop: '10px'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spin" /> Autenticando...
              </>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>

        <div className="login-footer" style={{
          marginTop: '28px',
          textAlign: 'center',
          paddingTop: '20px',
          borderTop: '1px solid var(--card-border)',
          fontSize: '0.8rem',
          color: 'var(--text-dim)'
        }}>
          <span className="login-footer-note">Contas são criadas exclusivamente pelo Administrador.</span>
        </div>
      </div>
    </div>
  );
};
