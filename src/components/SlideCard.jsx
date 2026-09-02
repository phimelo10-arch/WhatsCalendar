import { GripHorizontal, MoreVertical, Plus, Trash2, Upload, Link as LinkIcon, Copy } from 'lucide-react';
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
  handleCopyText,
  handleCopyImage,
  setExpandedImage
}) {
  return (
    <div className="w-[550px] shrink-0 bg-white rounded-xl shadow-sm border border-black/5 flex flex-col overflow-visible transition-all hover:shadow-md cursor-default">
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/5 bg-gray-50/50 group">
        <div className="drag-handle p-1.5 cursor-grab active:cursor-grabbing text-apple-gray hover:text-black hover:bg-black/5 rounded-md">
          <GripHorizontal size={14} />
        </div>
        
        <input
          type="text"
          placeholder=""
          value={slide.title || ''}
          onChange={(e) => updateSlideTitle(slide.id, e.target.value, colId)}
          className="text-[11px] font-bold uppercase tracking-wider text-apple-gray bg-transparent px-2 py-1 rounded focus:outline-none focus:bg-white focus:shadow-sm text-center w-32"
        />

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
      
      <div className="flex p-3 gap-3 h-[440px]">
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
        </div>
      </div>
    </div>
  );
}
