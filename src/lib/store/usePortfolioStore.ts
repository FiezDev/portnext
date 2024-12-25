import { create } from 'zustand';

interface PortfolioState {
  projects: Project[];
  skills: Skill[];
  setProjects: (projects: Project[]) => void;
  setSkills: (skills: Skill[]) => void;
}

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  link: string;
}

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  projects: [],
  skills: [],
  setProjects: (projects) => set({ projects }),
  setSkills: (skills) => set({ skills }),
}));