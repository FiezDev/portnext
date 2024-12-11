import { create } from 'zustand';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

interface WorkState {
  services: Service[];
  selectedService: Service | null;
  setServices: (services: Service[]) => void;
  selectService: (service: Service | null) => void;
}

export const useWorkStore = create<WorkState>((set) => ({
  services: [],
  selectedService: null,
  setServices: (services) => set({ services }),
  selectService: (service) => set({ selectedService: service }),
}));