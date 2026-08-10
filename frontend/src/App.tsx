import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Colaboradores } from './pages/Colaboradores';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'colaboradores'>('colaboradores');

  return (
    <div className="app-layout">
      {/* Menu Lateral Fixo */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Conteúdo Principal Dinâmico por Aba */}
      <main className="main-viewport">
        {activeTab === 'home' && <Home />}
        {activeTab === 'colaboradores' && <Colaboradores />}
      </main>
    </div>
  );
}

export default App;
