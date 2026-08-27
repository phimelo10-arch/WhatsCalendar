import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Check, Edit2 } from 'lucide-react';
import { generateStrategy } from '../services/aiService';

const LABELS = {
  metodo: "Método & Nome Único",
  icp: "Perfil de ICP Detalhado",
  linguagem: "Tom e Linguagem",
  transformacao: "A Grande Transformação",
  dores: "As 3 Maiores Dores",
  vilao: "O Vilão do Mercado",
  solucoesFalhas: "Soluções Falhas",
  cases: "Casos Práticos (Cases)",
  garantia: "Garantias & Ancoragem",
  transicao: "Gatilho de Transição",
  objecoes: "Quebra de Objeções"
};

export default function StrategyBoard({ project, updateProject, onBack, onProceed }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [strategyData, setStrategyData] = useState(project.completeBriefing || null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Sincroniza com o projeto caso seja atualizado de fora
  useEffect(() => {
    setStrategyData(project.completeBriefing || null);
  }, [project.completeBriefing]);

  const handleGenerate = async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      setError('Chave da API do Gemini não configurada. Vá nas configurações.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const generatedStrategy = await generateStrategy(project.minimalBriefing, apiKey);
      
      const updatedProject = {
        ...project,
        completeBriefing: generatedStrategy,
        updatedAt: new Date().toISOString()
      };
      
      updateProject(updatedProject);
      setStrategyData(generatedStrategy);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Falha ao gerar a estratégia.');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (key, value) => {
    setEditingField(key);
    setEditValue(value);
  };

  const saveEditing = () => {
    const newStrategyData = {
      ...strategyData,
      [editingField]: editValue
    };
    
    const updatedProject = {
      ...project,
      completeBriefing: newStrategyData,
      updatedAt: new Date().toISOString()
    };
    
    updateProject(updatedProject);
    setStrategyData(newStrategyData);
    setEditingField(null);
  };

  // Se a estratégia ainda não foi gerada
  if (!strategyData) {
    return (
      <div className="max-w-3xl mx-auto pb-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-apple-gray hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="bg-white p-12 rounded-3xl shadow-sm border border-black/5 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mb-6">
            <Sparkles className="text-apple-gray" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-4">Gerar Briefing Completo</h2>
          <p className="text-apple-gray max-w-md mx-auto mb-8 leading-relaxed">
            A IA agora vai pegar seus dados básicos e criar toda a arquitetura de vendas e copywriting para a sua apresentação.
          </p>

          {error && (
            <div className="w-full p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-left">
              {error}
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-all disabled:opacity-70 shadow-lg shadow-black/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {loading ? 'Calculando Estratégia de Coprywriting...' : 'Expandir Estratégia com IA'}
          </button>
        </div>
      </div>
    );
  }

  // Se a estratégia já existe, exibe o Dashboard
  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-apple-gray hover:text-black transition-colors"
        >
          <ArrowLeft size={16} /> Dashboard
        </button>
        
        <button 
          onClick={onProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors shadow-lg shadow-black/20"
        >
          Avançar para Slides (Kanban) <ArrowRight size={18} />
        </button>
      </div>

      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-2">Mesa de Estratégia</h2>
        <p className="text-apple-gray">Revise e edite a engenharia de oferta gerada pela IA antes de criar os slides.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(LABELS).map((key) => (
          <div key={key} className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 flex flex-col group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-apple-gray">
                {LABELS[key]}
              </h3>
              {editingField !== key && (
                <button 
                  onClick={() => startEditing(key, strategyData[key])}
                  className="p-1.5 text-apple-gray hover:bg-black/5 hover:text-black rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>

            {editingField === key ? (
              <div className="flex-1 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full flex-1 min-h-[120px] p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 resize-y text-sm leading-relaxed"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setEditingField(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={saveEditing}
                    className="flex items-center gap-1 px-3 py-1.5 bg-black text-white rounded-lg text-xs font-medium hover:bg-black/80 transition-colors"
                  >
                    <Check size={14} /> Salvar
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="flex-1 text-sm text-black leading-relaxed whitespace-pre-wrap cursor-pointer"
                onClick={() => startEditing(key, strategyData[key])}
              >
                {strategyData[key]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
