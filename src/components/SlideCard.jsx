import { GripHorizontal, MoreVertical, Plus, Trash2, Upload, Link as LinkIcon, Copy, ArrowUpRight, Edit2, Calendar } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

export default function SlideCard({
  slide,
  colId,
  updateSlideTitle,
  deleteSlide,
  insertSlideAfter,
  updateSlideImage,
  updateSlideContent,
  updateSlidePrompt,
  updateSlideGptLink,
  handleCopyText,
  handleCopyImage,
  setExpandedImage,
  isCompactMode
}) {
  return (
    <div className={`w-[550px] shrink-0 bg-white rounded-xl shadow-sm border border-black/5 flex flex-col overflow-hidden transition-all hover:shadow-md cursor-default relative ${isCompactMode ? 'h-[250px]' : ''}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/5 bg-gray-50/50 group shrink-0">
        <div className="drag-handle p-1.5 cursor-grab active:cursor-grabbing text-apple-gray hover:text-black hover:bg-black/5 rounded-md shrink-0">
          <GripHorizontal size={14} />
        </div>
        
        <div className="flex items-center gap-1 justify-center flex-1">
          <input
            type="text"
            placeholder=""
            value={slide.title || ''}
            onChange={(e) => updateSlideTitle(slide.id, e.target.value, colId)}
            className="text-[11px] font-bold uppercase tracking-wider text-apple-gray bg-transparent px-2 py-1 rounded focus:outline-none focus:bg-white focus:shadow-sm text-center w-32"
          />
          <button 
            onClick={() => {
              const days = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
              const today = new Date();
              const dayName = days[today.getDay()];
              const dateStr = String(today.getDate()).padStart(2, '0') + '/' + String(today.getMonth() + 1).padStart(2, '0');
              updateSlideTitle(slide.id, `${dayName} - ${dateStr}`, colId);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-apple-gray hover:text-black hover:bg-black/5 rounded-md transition-all shrink-0"
            title="Aplicar Data de Hoje"
          >
            <Calendar size={12} />
          </button>
        </div>

        <div className="flex gap-1 relative group/menu">
          <button 
            className="p-1.5 text-apple-gray hover:text-black hover:bg-black/5 rounded-md"
            title="Opções"
          >
            <MoreVertical size={14} />
          </button>
          <div className="absolute right-0 top-full mt-1 bg-white shadow-lg border border-black/10 rounded-lg p-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible z-[100] flex flex-col min-w-[140px]">
            <button 
              onClick={() => insertSlideAfter(slide.id, colId)}
              className="text-left px-3 py-2 text-xs hover:bg-black/5 rounded-md flex items-center gap-2"
            >
              <Plus size={14} /> Inserir depois
            </button>
            <button 
              onClick={() => deleteSlide(slide.id, colId)}
              className="text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-md flex items-center gap-2"
            >
              <Trash2 size={14} /> Excluir
            </button>
          </div>
        </div>
      </div>
      
      <div className={`flex p-3 gap-3 transition-all ${isCompactMode ? 'h-[250px]' : 'h-[500px]'}`}>
        {/* Lado Esquerdo: Imagem */}
        <div className="w-[200px] shrink-0 relative flex flex-col">
          {slide.imageUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-black/10 bg-black/5 h-full group/img">
              <img 
                src={slide.imageUrl} 
                alt="Imagem" 
                className="w-full h-full object-cover cursor-zoom-in" 
                onClick={() => setExpandedImage(slide.imageUrl)}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                <button 
                  className="p-1.5 text-apple-gray hover:text-black hover:bg-black/5 rounded-md border border-black/5 bg-white shadow-sm transition-all duration-200" 
                  onClick={(e) => handleCopyImage(e, slide.imageUrl)}
                  title="Copiar imagem"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                <button 
                  className="bg-white/90 p-1.5 rounded shadow-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors" 
                  onClick={(e) => {
                    e.stopPropagation();
                    updateSlideImage(slide.id, '', colId);
                  }}
                  title="Remover imagem"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative rounded-lg border-2 border-dashed border-black/10 bg-black/5 h-full flex flex-col items-center justify-center text-apple-gray group/upload transition-colors hover:border-black/30">
              <label className="flex flex-col items-center justify-center cursor-pointer hover:text-black w-full h-full z-0">
                <Upload size={24} className="mb-2 text-black/40" />
                <span className="text-xs">Upload Imagem</span>
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const MAX_WIDTH = 1080;
                          const MAX_HEIGHT = 1920;
                          let width = img.width;
                          let height = img.height;

                          if (width > height) {
                            if (width > MAX_WIDTH) {
                              height *= MAX_WIDTH / width;
                              width = MAX_WIDTH;
                            }
                          } else {
                            if (height > MAX_HEIGHT) {
                              width *= MAX_HEIGHT / height;
                              height = MAX_HEIGHT;
                            }
                          }
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0, width, height);
                          
                          canvas.toBlob(async (blob) => {
                            const fileName = `whats-calendar/postagem_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
                            try {
                              const { supabase } = await import('../services/supabase');
                              const { data, error } = await supabase.storage
                                .from('images')
                                .upload(fileName, blob, { contentType: 'image/jpeg' });
                              
                              if (error) {
                                alert("Erro no Supabase: Você precisa criar um Storage Bucket chamado 'images' e deixá-lo público. Erro: " + error.message);
                                return;
                              }
                              
                              const { data: { publicUrl } } = supabase.storage
                                .from('images')
                                .getPublicUrl(fileName);
                                
                              updateSlideImage(slide.id, publicUrl, colId);
                            } catch (err) {
                              alert("Erro inesperado ao subir imagem: " + err.message);
                            }
                          }, 'image/jpeg', 0.85);
                        };
                        img.src = event.target.result;
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const url = window.prompt("Cole a URL da imagem:");
                  if (url && url.trim()) updateSlideImage(slide.id, url.trim(), colId);
                }}
                className="absolute bottom-3 left-3 p-1.5 bg-white shadow-sm rounded-md border border-black/5 opacity-0 group-hover/upload:opacity-100 transition-opacity text-apple-gray hover:text-black z-10"
                title="Colar Link (URL) da imagem"
              >
                <LinkIcon size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Lado Direito: Texto e Prompt */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Bloco 1: Texto */}
          <div className="flex-1 flex flex-col border border-black/10 rounded-lg relative bg-white group/text">
            <div className="px-3 pt-2 pb-1 text-[10px] uppercase font-bold text-apple-gray/70 tracking-wider">Texto</div>
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover/text:opacity-100 transition-opacity">
              <button 
                onClick={(e) => handleCopyText(e, slide.content)}
                className="p-1.5 text-apple-gray hover:text-black hover:bg-black/5 rounded-md border border-black/5 bg-white shadow-sm transition-all duration-200"
                title="Copiar Texto"
              >
                <Copy size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <RichTextEditor 
                initialContent={slide.content}
                onChange={(newContent) => updateSlideContent(slide.id, newContent, colId)}
              />
            </div>
          </div>

          {/* Bloco 2: Prompt */}
          <div className="flex-1 flex flex-col border border-black/10 rounded-lg relative bg-white group/prompt">
            <div className="px-3 pt-2 pb-1 text-[10px] uppercase font-bold text-apple-gray/70 tracking-wider">Prompt da Imagem</div>
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover/prompt:opacity-100 transition-opacity">
              <button 
                onClick={(e) => handleCopyText(e, slide.prompt)}
                className="p-1.5 text-apple-gray hover:text-black hover:bg-black/5 rounded-md border border-black/5 bg-white shadow-sm transition-all duration-200"
                title="Copiar Prompt"
              >
                <Copy size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <RichTextEditor 
                initialContent={slide.prompt}
                onChange={(newContent) => updateSlidePrompt(slide.id, newContent, colId)}
              />
            </div>
          </div>

          {/* Botão GPT */}
          <div className="shrink-0 flex items-center justify-between border border-black/10 rounded-lg p-2.5 bg-white group/gpt relative">
            <button 
              onClick={() => {
                if (slide.gptLink) {
                  window.open(slide.gptLink, '_blank');
                } else {
                  const url = window.prompt("Insira o link da conversa do ChatGPT:");
                  if (url) updateSlideGptLink(slide.id, url.trim(), colId);
                }
              }}
              className="flex-1 flex items-center justify-between text-sm text-apple-gray hover:text-black font-medium transition-colors cursor-pointer outline-none"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.073zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3971l2.02-1.1686a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1686a.071.071 0 0 1-.0378-.0568V6.055a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.694 5.44a.7948.7948 0 0 0-.3927.6813v6.7418zm1.0976-2.3654l2.602-1.5034 2.602 1.5034v3.0069l-2.602 1.5034-2.602-1.5034V10.4976z"/>
              </svg>
              <span>{slide.gptLink ? 'Abrir no GPT' : 'Adicionar link do GPT'}</span>
              <ArrowUpRight size={18} />
            </button>
            {slide.gptLink && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const url = window.prompt("Editar link da conversa do ChatGPT:", slide.gptLink);
                  if (url !== null) updateSlideGptLink(slide.id, url.trim(), colId);
                }}
                className="absolute right-10 p-1.5 text-apple-gray hover:text-black hover:bg-black/5 rounded-md opacity-0 group-hover/gpt:opacity-100 transition-opacity"
                title="Editar Link"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {isCompactMode && (
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none" />
      )}
    </div>
  );
}
