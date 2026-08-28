import { useState } from 'react';
import { useProjects } from './hooks/useProjects';
import Dashboard from './components/Dashboard';
import BriefingForm from './components/BriefingForm';
import StrategyBoard from './components/StrategyBoard';
import SlideEditor from './components/SlideEditor';
import { Settings } from 'lucide-react';

function App() {
  const { projects, addProject, updateProject, deleteProject, getProject, loading } = useProjects();
  const [currentRoute, setCurrentRoute] = useState('dashboard'); // 'dashboard', 'briefing', 'strategy', 'editor'
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');

  const handleSaveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setShowSettings(false);
  };

  const navigateTo = (route, projectId = null) => {
    if (projectId) setCurrentProjectId(projectId);
    setCurrentRoute(route);
  };

  const handleNewFree = (name) => {
    const newProject = {
      id: `proj_${Date.now()}`,
      name: name,
      updatedAt: new Date().toISOString(),
      isFreeMode: true,
      slides: [] // O SlideEditor lidará com o estado vazio
    };
    addProject(newProject);
    navigateTo('editor', newProject.id);
  };

  const renderContent = () => {
    if (currentRoute === 'dashboard') {
      return (
        <Dashboard 
          projects={projects} 
          loading={loading}
          onNewFree={handleNewFree}
          onOpen={(id) => navigateTo('editor', id)}
          onDelete={deleteProject}
          onDuplicate={(id) => {
            const p = getProject(id);
            if(p) addProject({ ...p, id: `proj_${Date.now()}`, name: `${p.name} (Cópia)` });
          }}
        />
      );
    }
    
    if (currentRoute === 'editor') {
      const project = getProject(currentProjectId);
      if (!project) {
        navigateTo('dashboard');
        return null;
      }
      return (
        <SlideEditor 
          project={project} 
          updateProject={updateProject}
          onBack={() => navigateTo('dashboard')}
        />
      );
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('wc_auth') === 'true');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail === 'phi.melo10@gmail.com' && loginPassword === 'philipinho') {
      localStorage.setItem('wc_auth', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Email ou senha incorretos.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8] font-sans p-4">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-black/5 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Whats Calendar</h1>
            <p className="text-apple-gray text-sm">Faça login para acessar o sistema</p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email" 
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-black/10 rounded-xl focus:outline-none focus:border-black/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-black/10 rounded-xl focus:outline-none focus:border-black/30"
                required
              />
            </div>
            
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            
            <button 
              type="submit"
              className="w-full py-3 mt-4 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-black selection:bg-black selection:text-white">
      <header className="px-8 py-5 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-50 border-b border-black/5">
        <h1 className="text-xl font-bold tracking-tight cursor-pointer" onClick={() => navigateTo('dashboard')}>
          Whats Calendar
        </h1>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              localStorage.removeItem('wc_auth');
              setIsAuthenticated(false);
            }}
            className="text-xs font-medium text-apple-gray hover:text-black underline underline-offset-2 mr-4"
          >
            Sair
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-black/5 rounded-full transition-colors text-apple-gray hover:text-black">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 animate-in fade-in duration-500">
        {renderContent()}
      </main>

      {/* MODAL CONFIGURAÇÕES */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-black/5">
            <h2 className="text-xl font-bold mb-4">Configurações</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Chave da API do Gemini</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 bg-gray-50 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-black/30 transition-colors"
              />
              <p className="text-[11px] text-apple-gray mt-2 leading-relaxed">
                Esta chave fica salva apenas no seu navegador. Necessária para usar os recursos de Inteligência Artificial.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSettings(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black/5">
                Cancelar
              </button>
              <button onClick={handleSaveApiKey} className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 shadow-md">
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
