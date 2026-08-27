import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2 } from 'lucide-react';
import { suggestLearningPoints } from '../services/aiService';

const INITIAL_STATE = {
  evento: { titulo: '', aprendizado: '' },
  produto: { nome: '', tipo: '', descricao: '', modulos: '', preco: '' },
  expert: { nome: '', nicho: '', credencial: '', resultado: '' },
  historia: { vidaAntes: '', crise: '', virada: '', vidaHoje: '' }
};

export default function BriefingForm({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSuggestPoints = async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      setError('Configure a chave da API nas configurações (ícone de engrenagem).');
      return;
    }
    if (!formData.evento.titulo) {
      setError('Preencha o título da aula primeiro para a IA ter contexto.');
      return;
    }

    setError('');
    setLoadingSuggestion(true);
    try {
      const pontos = await suggestLearningPoints(formData.evento, apiKey);
      handleChange('evento', 'aprendizado', pontos);
    } catch (err) {
      setError(err.message || 'Falha ao sugerir.');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleSubmit = () => {
    const newProject = {
      id: `proj_${Date.now()}`,
      name: formData.evento.titulo || formData.produto.nome || 'Projeto Sem Nome',
      updatedAt: new Date().toISOString(),
      minimalBriefing: formData,
      completeBriefing: null,
      slides: []
    };
    onComplete(newProject);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            step >= i ? 'bg-black text-white' : 'bg-black/5 text-apple-gray'
          }`}>
            {step > i ? <Check size={16} /> : i}
          </div>
          {i !== 4 && (
            <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
              step > i ? 'bg-black' : 'bg-black/5'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <button 
        onClick={onCancel}
        className="flex items-center gap-2 text-sm font-medium text-apple-gray hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Voltar para Dashboard
      </button>

      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-black/5">
        {renderStepIndicator()}
        
        {error && (
          <div className="p-3 mb-6 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="min-h-[400px]">
          {/* PASSO 1: EVENTO/AULA (Antes era o passo 2) */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-semibold mb-2">O Evento / A Aula</h2>
                <p className="text-apple-gray mb-6">Como será a apresentação que vai introduzir o produto no mercado?</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Título do Evento ou Aula *</label>
                <input 
                  value={formData.evento.titulo}
                  onChange={(e) => handleChange('evento', 'titulo', e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="Ex: A Nova Era do Copywriting"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium">O que a pessoa aprenderá (3 a 5 pontos)?</label>
                  <button 
                    onClick={handleSuggestPoints}
                    disabled={loadingSuggestion}
                    className="flex items-center gap-1.5 text-xs font-medium text-black bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loadingSuggestion ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Sugerir com IA
                  </button>
                </div>
                <textarea 
                  value={formData.evento.aprendizado}
                  onChange={(e) => handleChange('evento', 'aprendizado', e.target.value)}
                  rows={5}
                  className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 resize-y leading-relaxed"
                  placeholder="Ex: Como criar textos que vendem, Como ancorar preços altos..."
                />
              </div>
            </div>
          )}

          {/* PASSO 2: PRODUTO (Antes era o passo 1) */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Detalhes do Produto</h2>
                <p className="text-apple-gray mb-1">Qual é a oferta que será vendida no Pitch Final?</p>
                <p className="text-xs text-apple-gray bg-black/5 p-2 rounded-lg inline-block">
                  Dica: Este é o produto pago (mentoria, curso, software) que revelaremos no fim da apresentação.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do Produto *</label>
                  <input 
                    value={formData.produto.nome}
                    onChange={(e) => handleChange('produto', 'nome', e.target.value)}
                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5"
                    placeholder="Ex: Formação Copywriter"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Produto</label>
                  <input 
                    value={formData.produto.tipo}
                    onChange={(e) => handleChange('produto', 'tipo', e.target.value)}
                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5"
                    placeholder="Ex: Curso, Mentoria, Serviço"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição (O que ele entrega)</label>
                <textarea 
                  value={formData.produto.descricao}
                  onChange={(e) => handleChange('produto', 'descricao', e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                  placeholder="Descreva a transformação principal que seu produto pago gera."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Módulos e Bônus</label>
                  <textarea 
                    value={formData.produto.modulos}
                    onChange={(e) => handleChange('produto', 'modulos', e.target.value)}
                    rows={2}
                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                    placeholder="Ex: 5 módulos práticos + bônus de templates"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preço Final de Venda</label>
                  <input 
                    value={formData.produto.preco}
                    onChange={(e) => handleChange('produto', 'preco', e.target.value)}
                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5"
                    placeholder="Ex: R$ 997,00"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASSO 3: EXPERT */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-semibold mb-2">O Expert (A Autoridade)</h2>
                <p className="text-apple-gray mb-6">Quem é a pessoa guiando essa apresentação?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do Expert</label>
                  <input 
                    value={formData.expert.nome}
                    onChange={(e) => handleChange('expert', 'nome', e.target.value)}
                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nicho / Mercado</label>
                  <input 
                    value={formData.expert.nicho}
                    onChange={(e) => handleChange('expert', 'nicho', e.target.value)}
                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5"
                    placeholder="Ex: Marketing Digital"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Credencial Principal (1 Linha)</label>
                <input 
                  value={formData.expert.credencial}
                  onChange={(e) => handleChange('expert', 'credencial', e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="Ex: Autor best-seller, Criador do método X"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Maior Resultado Comprovado (Em números)</label>
                <input 
                  value={formData.expert.resultado}
                  onChange={(e) => handleChange('expert', 'resultado', e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="Ex: Faturou 1 Milhão em 7 dias, Atendeu +5000 clientes"
                />
              </div>
            </div>
          )}

          {/* PASSO 4: HISTÓRIA */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-semibold mb-2">A História (Jornada do Herói)</h2>
                <p className="text-apple-gray mb-6">A conexão emocional que fará o público confiar no expert.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2">A Vida Antes (Dor Inicial)</label>
                  <textarea 
                    value={formData.historia.vidaAntes}
                    onChange={(e) => handleChange('historia', 'vidaAntes', e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                    placeholder="Como era a vida antes de descobrir o método?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fundo do Poço (A Crise)</label>
                  <textarea 
                    value={formData.historia.crise}
                    onChange={(e) => handleChange('historia', 'crise', e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                    placeholder="Qual foi o pior momento que obrigou o expert a mudar?"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2">A Descoberta (A Virada)</label>
                  <textarea 
                    value={formData.historia.virada}
                    onChange={(e) => handleChange('historia', 'virada', e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                    placeholder="O que o expert descobriu ou inventou para virar o jogo?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">A Vida Hoje (Conquistas)</label>
                  <textarea 
                    value={formData.historia.vidaHoje}
                    onChange={(e) => handleChange('historia', 'vidaHoje', e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                    placeholder="Como é a vida hoje, provando que o método funciona?"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CONTROLES DO WIZARD */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/5">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-black hover:bg-black/5 transition-colors disabled:opacity-30"
          >
            Voltar
          </button>
          
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors"
            >
              Próximo Passo <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors shadow-lg shadow-black/20"
            >
              <Sparkles size={18} /> Avançar para Estratégia
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
