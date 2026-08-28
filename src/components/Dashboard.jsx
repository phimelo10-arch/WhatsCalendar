import { Plus, FileText, Copy, Trash2, ArrowRight, Loader2, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function Dashboard({ projects, loading, onNewFree, onOpen, onDelete, onDuplicate }) {
  const handleNewFree = () => {
    const nome = window.prompt("Qual o nome do seu Calendário/Projeto?");
    if (nome && nome.trim()) {
      onNewFree(nome.trim());
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mb-6">
        <FileText className="text-apple-gray" size={32} />
      </div>
      <h2 className="text-xl font-semibold mb-2">Nenhum calendário</h2>
      <p className="text-apple-gray mb-8 max-w-sm">
        Crie seu primeiro calendário para organizar suas postagens do WhatsApp.
      </p>
      <button 
        onClick={handleNewFree}
        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors shadow-lg shadow-black/20"
      >
        <Plus size={20} />
        Criar Calendário
      </button>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-medium">Seus Projetos</h2>
        <button 
          onClick={handleNewFree}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/80 transition-colors"
        >
          <Plus size={16} /> Novo
        </button>
      </div>

      {loading && projects.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-apple-gray">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id}
              className="group bg-white border border-black/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer relative overflow-hidden"
              onClick={() => onOpen(project.id)}
            >
              {project.isFreeMode && (
                <div className="absolute top-0 right-0 bg-black/5 text-apple-gray text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                  LIVRE
                </div>
              )}
              
              <div className="flex-1 mb-6 mt-2">
                <h3 className="font-semibold text-lg line-clamp-1 mb-1">{project.name}</h3>
                <p className="text-xs text-apple-gray">
                  Atualizado em {new Date(project.updatedAt).toLocaleDateString()}
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="text-xs px-2 py-1 bg-black/5 rounded-md text-apple-gray">
                    {project.slides?.length || 0} slides
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-black/5">
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDuplicate(project.id); }}
                    className="p-2 text-apple-gray hover:text-black hover:bg-black/5 rounded-lg transition-colors"
                    title="Duplicar"
                  >
                    <Copy size={16} />
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if(confirm('Tem certeza que deseja excluir?')) onDelete(project.id); 
                    }}
                    className="p-2 text-apple-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <button className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Abrir <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
