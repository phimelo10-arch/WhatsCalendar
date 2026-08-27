import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'geradorv2_projects';

export function useProjects() {
  const [projects, setProjects] = useState(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  const saveToStorage = useCallback((newProjects) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    saveToStorage(projects);
  }, [projects, saveToStorage]);

  const addProject = (project) => {
    setProjects(prev => [project, ...prev]);
  };

  const updateProject = (updatedProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const getProject = (id) => {
    return projects.find(p => p.id === id);
  };

  return { projects, addProject, updateProject, deleteProject, getProject };
}
