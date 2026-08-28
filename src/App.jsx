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
      minimalBriefing: null,
      completeBriefing: null,
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

  return (
    <div className="min-h-screen p-6 md:p-12">
      <header className={`flex justify-between items-center mb-8 ${currentRoute === 'editor' ? 'w-full' : 'max-w-5xl mx-auto'}`}>
        <h1 
          className="text-2xl font-bold tracking-tight cursor-pointer" 
          onClick={() => navigateTo('dashboard')}
        >
          Whats Calendar
        </h1>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 text-apple-gray hover:text-apple-dark transition-colors rounded-full hover:bg-black/5"
        >
          <Settings size={20} />
        </button>
      </header>

      <main className={currentRoute === 'editor' ? "w-full" : "max-w-5xl mx-auto"}>
        {renderContent()}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-black/5">
            <h2 className="text-xl font-semibold mb-4">Configurações</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-apple-gray mb-2">
                Chave da API do Google Gemini
              </label>
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
                placeholder="AIzaSy..."
              />
              <p className="text-xs text-apple-gray mt-2">
                Salva apenas localmente no seu navegador.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-black/80 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
