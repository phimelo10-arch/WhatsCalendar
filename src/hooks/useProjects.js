import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .schema('whats_calendar')
          .from('projects')
          .select('*')
          .order('updatedAt', { ascending: false });
          
        if (error) {
          console.error("Erro ao buscar projetos do Supabase:", error);
          return;
        }
        
        if (data) setProjects(data);
      } catch (err) {
        console.error("Erro inesperado ao carregar projetos:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  const saveToDb = async (projectToSave) => {
    try {
      const { error } = await supabase
        .schema('whats_calendar')
        .from('projects')
        .upsert(projectToSave);
        
      if (error) console.error("Erro ao salvar projeto no Supabase:", error);
    } catch (err) {
      console.error("Erro inesperado ao salvar:", err);
    }
  };

  const addProject = (project) => {
    setProjects(prev => [project, ...prev]);
    saveToDb(project);
  };

  const updateProject = (updatedProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    saveToDb(updatedProject);
  };

  const deleteProject = async (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    
    try {
      const { error } = await supabase
        .schema('whats_calendar')
        .from('projects')
        .delete()
        .eq('id', id);
        
      if (error) console.error("Erro ao deletar projeto do Supabase:", error);
    } catch (err) {
      console.error("Erro inesperado ao deletar:", err);
    }
  };

  const getProject = (id) => {
    return projects.find(p => p.id === id);
  };

  return { projects, addProject, updateProject, deleteProject, getProject, loading };
}
