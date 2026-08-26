import React, { useState } from 'react';
import { 
  Eye, 
  X, 
  RotateCcw, 
  Volume2, 
  Type, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  MousePointerClick, 
  Contrast, 
  Layers
} from 'lucide-react';
import { useAccessibility, FontScale } from '../context/AccessibilityContext';
import { useSnackbar } from '../context/SnackbarContext';

export const AccessibilityModal: React.FC = () => {
  const { settings, updateSetting, resetSettings, isModalOpen, setIsModalOpen } = useAccessibility();
  const { showSnackbar } = useSnackbar();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [demoInputValue, setDemoInputValue] = useState('Mariana Rios Silva');

  if (!isModalOpen) return null;

  const handleSpeechDemo = () => {
    if (!('speechSynthesis' in window)) {
      showSnackbar('Seu navegador não suporta síntese de voz (TTS).', 'info');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const texto = `Demonstração do Regz. Colaboradora Mariana Rios Silva. Cargo: Desenvolvedora Full Stack. Status: Ativa no sistema.`;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSaveAndClose = () => {
    showSnackbar('Preferências de acessibilidade aplicadas com sucesso!', 'success');
    setIsModalOpen(false);
  };

  const fontOptions: { id: FontScale; label: string; sub: string; size: string }[] = [
    { id: 'normal', label: 'Padrão', sub: '100%', size: '1rem' },
    { id: 'medium', label: 'Médio', sub: '115%', size: '1.15rem' },
    { id: 'large', label: 'Grande', sub: '130%', size: '1.3rem' },
    { id: 'xlarge', label: 'Extra', sub: '145%', size: '1.45rem' },
  ];

  return (
    <div 
      className="modal-backdrop"
      style={{
        zIndex: 99999,
        background: 'rgba(5, 7, 15, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="modal-content glass-panel accessibility-modal-container"
        style={{
          width: '95vw',
          maxWidth: '1350px',
          height: '92vh',
          maxHeight: '880px',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(99, 102, 241, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Módulo */}
        <div 
          className="modal-header" 
          style={{ 
            padding: '20px 28px', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Eye size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Central de <span className="text-gradient">Acessibilidade Visual</span>
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Personalize o contraste, tamanho de fontes e realces com simulação em tempo real para pessoas com baixa visão.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', padding: '4px 10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
              Atalho: <kbd style={{ fontWeight: 700, color: '#a5b4fc' }}>Alt + A</kbd>
            </span>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="btn-close"
              title="Fechar módulo de acessibilidade"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Corpo Dividido em 2 Colunas: Configurações & Pré-visualização */}
        <div 
          style={{ 
            flex: 1, 
            display: 'grid', 
            gridTemplateColumns: 'minmax(420px, 1.15fr) minmax(420px, 1fr)', 
            gap: '24px', 
            padding: '24px 28px',
            overflowY: 'auto'
          }}
          className="custom-scrollbar"
        >
          {/* LADO ESQUERDO: CONTROLES & CONFIGURAÇÕES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Bloco 1: Escala de Fonte */}
            <div 
              style={{
                padding: '18px 20px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Type size={18} style={{ color: '#818cf8' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Tamanho de Texto Global</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Amplia a legibilidade das letras de todas as tabelas, botões e formulários do sistema.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {fontOptions.map((opt) => {
                  const isSelected = settings.fontScale === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateSetting('fontScale', opt.id)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                        color: isSelected ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 0 14px rgba(99, 102, 241, 0.3)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: opt.size, fontWeight: 800 }}>A</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{opt.label}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{opt.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bloco 2: Alto Contraste para Baixa Visão */}
            <div 
              style={{
                padding: '18px 20px',
                borderRadius: '16px',
                background: settings.highContrast ? 'rgba(250, 204, 21, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: settings.highContrast ? '1.5px solid #facc15' : '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Contrast size={18} style={{ color: settings.highContrast ? '#facc15' : '#818cf8' }} />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Modo Alto Contraste Puro</span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      Fundo preto absoluto com textos em amarelo ouro e branco, eliminando transparências.
                    </p>
                  </div>
                </div>

                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={(e) => updateSetting('highContrast', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings.highContrast ? '#facc15' : 'rgba(255, 255, 255, 0.18)',
                      transition: '0.3s',
                      borderRadius: '26px'
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: '20px',
                        width: '20px',
                        left: settings.highContrast ? '24px' : '3px',
                        bottom: '3px',
                        backgroundColor: settings.highContrast ? '#000000' : '#ffffff',
                        transition: '0.3s',
                        borderRadius: '50%'
                      }}
                    />
                  </span>
                </label>
              </div>
            </div>

            {/* Bloco 3: Destaque de Foco e Áreas de Clique */}
            <div 
              style={{
                padding: '18px 20px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              {/* Item: Foco Reforçado */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MousePointerClick size={18} style={{ color: '#38bdf8' }} />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Realce de Foco Reforçado</span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '1px 0 0 0' }}>
                      Borda vibrante e anel luminoso em inputs e botões ativos via teclado ou clique.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.focusHighlight}
                  onChange={(e) => updateSetting('focusHighlight', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#6366f1' }}
                />
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)' }} />

              {/* Item: Áreas de Clique e Ícones Ampliados */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers size={18} style={{ color: '#34d399' }} />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Áreas de Clique e Ícones Ampliados</span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '1px 0 0 0' }}>
                      Aumenta o espaçamento de botões e ações de tabelas para facilitar o toque.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.largeClickables}
                  onChange={(e) => updateSetting('largeClickables', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#6366f1' }}
                />
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)' }} />

              {/* Item: Modo Monocromático */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sliders size={18} style={{ color: '#f43f5e' }} />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Modo Monocromático (Escala de Cinza)</span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '1px 0 0 0' }}>
                      Filtro de alto contraste preto & branco para fotofobia ou daltonismo severo.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.monochrome}
                  onChange={(e) => updateSetting('monochrome', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#6366f1' }}
                />
              </div>
            </div>

          </div>

          {/* LADO DIREITO: PRÉ-VISUALIZAÇÃO EM TEMPO REAL */}
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              padding: '20px',
              borderRadius: '20px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1.5px dashed rgba(255, 255, 255, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: '#a855f7' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pré-visualização em Tempo Real
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Atualização Dinâmica
              </span>
            </div>

            {/* Caixa Simuladora */}
            <div 
              className="glass-panel"
              style={{
                flex: 1,
                padding: '20px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Exemplo de Card de Colaborador
                  </span>
                  <button 
                    onClick={handleSpeechDemo}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="Ouvir leitura em voz alta"
                  >
                    <Volume2 size={14} style={{ color: isPlayingAudio ? '#facc15' : '#818cf8' }} />
                    {isPlayingAudio ? 'Falando...' : 'Ouvir Dados'}
                  </button>
                </div>

                {/* Card de Demonstração */}
                <div 
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                  }}
                >
                  <div 
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      color: '#ffffff'
                    }}
                  >
                    MR
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0, fontWeight: 700 }}>Mariana Rios Silva</h4>
                      <span className="badge-perfil" style={{ fontSize: '0.72rem' }}>Ativo</span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Desenvolvedora Full Stack • São Paulo - SP
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulação de Campo de Formulário */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Nome Completo do Colaborador *
                </label>
                <input
                  type="text"
                  value={demoInputValue}
                  onChange={(e) => setDemoInputValue(e.target.value)}
                  placeholder="Digite para testar o foco..."
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              {/* Simulação de Botões de Ação */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button type="button" className="btn-primary" style={{ flex: 1 }}>
                  Salvar Alterações
                </button>
                <button type="button" className="btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center', margin: 0 }}>
              Todas as configurações são aplicadas instantaneamente e salvas no seu navegador para todas as páginas.
            </p>
          </div>
        </div>

        {/* Rodapé do Módulo com Ações Globais */}
        <div 
          style={{ 
            padding: '16px 28px', 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <button
            type="button"
            onClick={resetSettings}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RotateCcw size={16} /> Redefinir Padrões
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
            >
              <CheckCircle2 size={18} /> Aplicar e Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
