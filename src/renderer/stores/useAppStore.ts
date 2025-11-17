import { create } from 'zustand';
import type { AppConfig } from '@shared/types';

interface AppState {
  config: AppConfig | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setConfig: (config: AppConfig) => void;
  updateConfig: (config: Partial<AppConfig>) => Promise<void>;
  loadConfig: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  config: null,
  isLoading: false,
  error: null,

  setConfig: (config) => set({ config }),

  updateConfig: async (newConfig) => {
    try {
      set({ isLoading: true, error: null });
      const result = await window.electron.config.set(newConfig);

      if (result.success) {
        set((state) => ({
          config: state.config ? { ...state.config, ...newConfig } : null,
        }));
      } else {
        set({ error: result.error || 'Failed to update config' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadConfig: async () => {
    try {
      set({ isLoading: true, error: null });
      const result = await window.electron.config.get();

      if (result.success && result.data) {
        set({ config: result.data });
      } else {
        set({ error: result.error || 'Failed to load config' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
