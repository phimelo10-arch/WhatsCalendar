import { useState, useRef, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { ArrowLeft, Plus, Copy, Trash2, GripHorizontal, Check, Loader2, Sparkles, Type, Edit2, Upload, Link as LinkIcon, MoreVertical, Save } from 'lucide-react';
import { generatePresentation } from '../services/aiService';
import { supabase } from '../services/supabase';

const DEFAULT_COLUMNS = [
  { id: 'intro', title: 'Introdução & Atenção' },
  { id: 'historia', title: 'História & Conexão' },
  { id: 'conteudo', title: 'Método & Conteúdo' },
  { id: 'pitch', title: 'Oferta & Pitch' }
];

import SlideCard from './SlideCard';

export default function SlideEditor({ project, updateProject, onBack }) {
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedImage, setExpandedImage] = useState(null);

  const columns = project.columns || DEFAULT_COLUMNS;
  const slides = project.slides || [];

  const [localColumns, setLocalColumns] = useState(() => {
    const state = {};
    columns.forEach(c => {
      state[c.id] = slides.filter(s => s.columnId === c.id);
    });
    return state;
  });

  useEffect(() => {
    const flatSlides = [];
    columns.forEach(c => {
      if (localColumns[c.id]) {
        flatSlides.push(...localColumns[c.id].map(s => ({ ...s, columnId: c.id })));
      }
    });

    const currentProjectStr = JSON.stringify(slides);
    const newProjectStr = JSON.stringify(flatSlides);

    if (currentProjectStr !== newProjectStr) {
      updateProject({
        ...project,
        slides: flatSlides,
        updatedAt: new Date().toISOString()
      });
    }
  }, [localColumns, project, columns, updateProject, slides]);

  const handleGenerate = async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      setError('Chave da API do Gemini não configurada.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const generatedSlides = await generatePresentation(project, apiKey);
      const newState = {};
      columns.forEach(c => {
        newState[c.id] = generatedSlides.filter(s => s.columnId === c.id);
      });
      setLocalColumns(newState);
      updateProject({
        ...project,
        slides: generatedSlides,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message || 'Falha ao gerar os slides.');
    } finally {
      setLoading(false);
    }
  };

  const updateSlideContent = (id, newContent, colId) => {
    setLocalColumns(prev => ({
      ...prev,
      [colId]: prev[colId].map(s => s.id === id ? { ...s, content: newContent } : s)
    }));
  };

  const updateSlidePrompt = (id, newPrompt, colId) => {
    setLocalColumns(prev => ({
      ...prev,
      [colId]: prev[colId].map(s => s.id === id ? { ...s, prompt: newPrompt } : s)
    }));
  };

  const updateSlideGptLink = (id, newLink, colId) => {
    setLocalColumns(prev => ({
      ...prev,
      [colId]: prev[colId].map(s => s.id === id ? { ...s, gptLink: newLink } : s)
    }));
  };

  const updateSlideImage = (id, newImageUrl, colId) => {
    setLocalColumns(prev => ({
      ...prev,
      [colId]: prev[colId].map(s => s.id === id ? { ...s, imageUrl: newImageUrl } : s)
    }));
  };

  const updateSlideTitle = (id, newTitle, colId) => {
    setLocalColumns(prev => ({
      ...prev,
      [colId]: prev[colId].map(s => s.id === id ? { ...s, title: newTitle } : s)
    }));
  };

  const handleCopyText = (e, htmlContent) => {
    let contentHtml = htmlContent || '';
    contentHtml = contentHtml.replace(/<br\s*\/?>/gi, '\n');
    contentHtml = contentHtml.replace(/<\/p>/gi, '\n');
    contentHtml = contentHtml.replace(/<\/div>/gi, '\n');
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentHtml;
    let text = tempDiv.textContent || tempDiv.innerText || '';
    text = text.replace(/\n{3,}/g, '\n\n').trim();
    
    navigator.clipboard.writeText(text);
    
    const btn = e.currentTarget;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    btn.classList.add('text-green-600', 'bg-green-50', 'border-green-200');
    setTimeout(() => {
      btn.innerHTML = originalHtml;
      btn.classList.remove('text-green-600', 'bg-green-50', 'border-green-200');
    }, 1000);
  };

  const handleCopyImage = async (e, imageUrl) => {
    e.stopPropagation(); // Evita abrir o lightbox
    const btn = e.currentTarget;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = URL.createObjectURL(blob);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(async (pngBlob) => {
        if (!pngBlob) throw new Error("Falha ao converter para PNG");
        
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': pngBlob })
        ]);
        
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        btn.classList.add('text-green-600', 'bg-green-50', 'border-green-200');
        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.classList.remove('text-green-600', 'bg-green-50', 'border-green-200');
        }, 1000);
      }, 'image/png');
      
    } catch (err) {
      console.error("Erro ao copiar imagem:", err);
      alert("Não foi possível copiar a imagem automaticamente. Pode ser um bloqueio de segurança do link (CORS).");
    }
  };

  const addBlankSlide = (columnId) => {
    const newSlide = {
      id: `slide_${Date.now()}`,
      columnId,
      type: 'Novo Slide',
      title: '',
      content: ''
    };
    setLocalColumns(prev => ({
      ...prev,
      [columnId]: [...(prev[columnId] || []), newSlide]
    }));
  };

  const deleteSlide = (id, colId) => {
    setLocalColumns(prev => ({
      ...prev,
      [colId]: prev[colId].filter(s => s.id !== id)
    }));
  };

  const insertSlideAfter = (id, colId) => {
    const newSlide = {
      id: `slide_${Date.now()}`,
      columnId: colId,
      type: 'Novo Slide',
      title: '',
      content: ''
    };
    setLocalColumns(prev => {
      const colSlides = [...(prev[colId] || [])];
      const index = colSlides.findIndex(s => s.id === id);
      colSlides.splice(index + 1, 0, newSlide);
      return {
        ...prev,
        [colId]: colSlides
      };
    });
  };

  // GERENCIAMENTO DE BLOCOS
  const addBlock = () => {
    const newColId = `col_${Date.now()}`;
    const newCol = { id: newColId, title: 'Novo Bloco' };
    
    setLocalColumns(prev => ({ ...prev, [newColId]: [] }));
    
    updateProject({
      ...project,
      columns: [...columns, newCol],
      updatedAt: new Date().toISOString()
    });
  };

  const deleteBlock = (colId) => {
    if (!window.confirm("Tem certeza que deseja excluir este bloco inteiro e todos os seus slides?")) return;
    
    const newColumns = columns.filter(c => c.id !== colId);
    const newSlides = slides.filter(s => s.columnId !== colId);
    
    const newLocal = { ...localColumns };
    delete newLocal[colId];
    setLocalColumns(newLocal);

    updateProject({
      ...project,
      columns: newColumns,
      slides: newSlides,
      updatedAt: new Date().toISOString()
    });
  };

  const updateBlockTitle = (colId, newTitle) => {
    const newColumns = columns.map(c => c.id === colId ? { ...c, title: newTitle } : c);
    updateProject({
      ...project,
      columns: newColumns,
      updatedAt: new Date().toISOString()
    });
  };

  const updateBlockAvatar = (colId, newAvatarUrl) => {
    const newColumns = columns.map(c => c.id === colId ? { ...c, avatarUrl: newAvatarUrl } : c);
    updateProject({
      ...project,
      columns: newColumns,
      updatedAt: new Date().toISOString()
    });
  };

  const handleUploadBlockAvatar = (e, colId) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 200;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX) { height *= MAX / width; width = MAX; }
          } else {
            if (height > MAX) { width *= MAX / height; height = MAX; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(async (blob) => {
            const fileName = `whats-calendar/avatar_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const { error } = await supabase.storage.from('images').upload(fileName, blob, { contentType: 'image/jpeg' });
            if (!error) {
              const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
              updateBlockAvatar(colId, publicUrl);
            }
          }, 'image/jpeg', 0.85);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
    }
  };

  const flatSlidesList = [];
  columns.forEach(c => {
    if (localColumns[c.id]) {
      flatSlidesList.push(...localColumns[c.id]);
    }
  });

  const copyAll = () => {
    const text = columns.map(col => {
      const colSlides = localColumns[col.id] || [];
      if (colSlides.length === 0) return '';
      
      const cleanHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
      };

      const slidesText = colSlides.map(s => {
        const globalIndex = flatSlidesList.findIndex(fs => fs.id === s.id) + 1;
        const isAiTitle = s.type && s.type !== 'Novo Slide' && s.type !== 'Slide';
        const titleStr = isAiTitle ? ` • ${s.type}` : '';
        
        return `[Slide ${globalIndex}${titleStr}]\n${cleanHtml(s.content)}`;
      }).join('\n\n---\n\n');

      return `### ${col.title.toUpperCase()}\n\n${slidesText}`;
    }).filter(Boolean).join('\n\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (slides.length === 0 && !project.isFreeMode) {
    return (
      <div className="max-w-3xl mx-auto pb-12">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-apple-gray hover:text-black mb-8">
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-black/5 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mb-6">
            <Sparkles className="text-apple-gray" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-4">Gerar o Storyboard Kanban</h2>
          <p className="text-apple-gray max-w-md mx-auto mb-8 leading-relaxed">
            A IA analisará sua Mesa de Estratégia e criará o roteiro exato, slide por slide, agrupado nos blocos do seu pitch.
          </p>
          {error && <div className="w-full p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-left">{error}</div>}
          <button 
            onClick={handleGenerate} disabled={loading}
            className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-all disabled:opacity-70 shadow-lg shadow-black/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {loading ? 'Escrevendo os Slides...' : 'Gerar Roteiro Completo'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* HEADER */}
      <div className="sticky top-[72px] z-40 bg-[#FDFCF8]/95 backdrop-blur-md pt-8 pb-4 mb-6 -mt-8 -mx-8 px-8 border-b border-black/5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-apple-gray hover:text-black">
            <ArrowLeft size={16} /> {project.isFreeMode ? 'Dashboard' : 'Estratégia'}
          </button>
          <div className="border-l border-black/10 pl-4">
            <h2 className="text-xl font-bold">{project.name}</h2>
            {project.isFreeMode && <span className="text-[10px] uppercase font-bold text-apple-gray">Modo Livre</span>}
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="hidden md:flex gap-2 text-xs text-apple-gray bg-black/5 px-3 py-1.5 rounded-lg items-center">
            <Type size={12} />
            <span className="font-semibold">Atalhos:</span>
            <span>Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+S.</span>
            <span className="ml-2 font-semibold">Tamanhos:</span>
            <span>Ctrl+1, Ctrl+2, Ctrl+0.</span>
          </div>
          
          <button 
            onClick={() => {
              // Como o auto-save já ocorre na digitação (blur), 
              // forçamos uma re-salva chamando o updateProject com o projeto atual
              setIsSaving(true);
              updateProject(project);
              setTimeout(() => {
                setIsSaving(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }, 500); // pequeno delay para dar sensação de salvamento
            }}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              saved 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-black text-white hover:bg-black/80'
            }`}
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saved ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Projeto'}
          </button>
        </div>
      </div>

      {/* HORIZONTAL STORYBOARD (ROWS) */}
      <div className="flex-1 flex flex-col gap-8 pb-12 w-full">
        {columns.map((col, blockIndex) => {
          const columnSlides = localColumns[col.id] || [];
          return (
            <div key={col.id} className="w-full bg-black/5 rounded-3xl p-6 flex flex-col group/block">
              <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-apple-gray font-bold">{blockIndex + 1}.</span>
                  
                  <div className="relative group/bavatar w-8 h-8 shrink-0">
                    <label className="w-full h-full rounded-full bg-white border border-black/10 overflow-hidden cursor-pointer flex items-center justify-center hover:border-black/30 transition-colors shadow-sm block">
                      {col.avatarUrl ? (
                        <img src={col.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Upload size={14} className="text-apple-gray/60" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadBlockAvatar(e, col.id)}
                      />
                    </label>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const url = window.prompt("Cole o link da imagem:");
                        if (url && url.trim()) updateBlockAvatar(col.id, url.trim());
                      }}
                      className="absolute -bottom-1 -right-1 p-1 bg-white shadow-sm rounded-md border border-black/5 opacity-0 group-hover/bavatar:opacity-100 transition-opacity text-apple-gray hover:text-black z-10"
                      title="Colar Link da imagem"
                    >
                      <LinkIcon size={10} />
                    </button>
                  </div>

                  <input 
                    type="text"
                    value={col.title}
                    onChange={(e) => updateBlockTitle(col.id, e.target.value)}
                    className="flex-1 min-w-[300px] font-semibold text-sm uppercase tracking-wider bg-transparent focus:outline-none focus:bg-white focus:px-3 focus:py-1 focus:rounded-lg focus:shadow-sm transition-all"
                    placeholder="Nome do Bloco"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="bg-black/10 text-xs font-bold px-2 py-1 rounded-full">{columnSlides.length}</span>
                  <button 
                    onClick={() => deleteBlock(col.id)}
                    className="opacity-0 group-hover/block:opacity-100 p-1.5 text-apple-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Excluir Bloco Inteiro"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex overflow-x-auto pb-4 gap-4 p-2 min-h-[220px] rounded-xl transition-colors items-stretch">
                <ReactSortable
                  list={columnSlides}
                  setList={(newState) => setLocalColumns(prev => ({ ...prev, [col.id]: newState }))}
                  group="slides"
                  animation={200}
                  ghostClass="opacity-50"
                  handle=".drag-handle"
                  className="flex gap-4 shrink-0"
                >
                  {columnSlides.map((slide) => {
                    const globalIndex = flatSlidesList.findIndex(s => s.id === slide.id);
                    const isAiTitle = slide.type && slide.type !== 'Novo Slide' && slide.type !== 'Slide';
                    
                    return (
                      <SlideCard 
                        key={slide.id}
                        slide={slide}
                        colId={col.id}
                        updateSlideTitle={updateSlideTitle}
                        deleteSlide={deleteSlide}
                        insertSlideAfter={insertSlideAfter}
                        updateSlideImage={updateSlideImage}
                        updateSlideContent={updateSlideContent}
                        updateSlidePrompt={updateSlidePrompt}
                        updateSlideGptLink={updateSlideGptLink}
                        handleCopyText={handleCopyText}
                        handleCopyImage={handleCopyImage}
                        setExpandedImage={setExpandedImage}
                      />
                    );
                  })}
                </ReactSortable>
                
                <button 
                  onClick={() => addBlankSlide(col.id)}
                  className="w-[220px] shrink-0 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-black/10 text-apple-gray rounded-xl hover:border-black/20 hover:text-black transition-colors text-sm font-medium h-[546px]"
                >
                  <Plus size={24} /> Adicionar postagem
                </button>
              </div>
            </div>
          );
        })}

        <button 
          onClick={addBlock}
          className="w-full flex items-center justify-center gap-3 py-6 bg-black/5 hover:bg-black/10 text-apple-dark rounded-3xl font-medium transition-colors border-2 border-dashed border-black/10 hover:border-black/20"
        >
          <Plus size={20} /> Adicionar Novo Bloco (Sessão)
        </button>
      </div>

      {/* Lightbox para imagem expandida */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 cursor-zoom-out animate-in fade-in duration-200 group/lightbox"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-full max-h-[90vh] flex items-center justify-center">
            <img 
              src={expandedImage} 
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 cursor-default" 
              alt="Expanded view" 
              onClick={(e) => e.stopPropagation()}
            />
            {/* Copy Button Lightbox */}
            <button 
              onClick={(e) => handleCopyImage(e, expandedImage)}
              className="absolute top-4 right-4 p-3 bg-white/90 text-apple-gray hover:text-black hover:bg-white rounded-xl border border-black/10 shadow-lg transition-all duration-200 flex items-center gap-2 font-medium backdrop-blur-md"
              title="Copiar Imagem"
            >
              <Copy size={18} /> <span className="hidden md:inline">Copiar Imagem</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
