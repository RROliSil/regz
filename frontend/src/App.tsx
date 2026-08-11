import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Colaboradores } from './pages/Colaboradores';
import { Campos } from './pages/Campos';

export function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        {/* Menu Lateral Fixo com Roteamento */}
        <Sidebar />

        {/* Conteúdo Principal por Rota de URL Real */}
        <main className="main-viewport">
          <Routes>
            <Route path="/" element={<Navigate to="/colaboradores" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/colaboradores" element={<Colaboradores />} />
            <Route path="/campos" element={<Campos />} />
            <Route path="*" element={<Navigate to="/colaboradores" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
