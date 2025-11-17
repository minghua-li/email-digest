import { create } from 'zustand';
import type { DigestData, DigestListItem, SearchParams } from '@shared/types';

interface DigestState {
  digests: DigestListItem[];
  currentDigest: DigestData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadDigests: () => Promise<void>;
  loadDigest: (id: string) => Promise<void>;
  saveDigest: (digest: DigestData) => Promise<void>;
  deleteDigest: (id: string) => Promise<void>;
  updateDigest: (digest: DigestData) => Promise<void>;
  searchDigests: (params: SearchParams) => Promise<void>;
  setCurrentDigest: (digest: DigestData | null) => void;
  setError: (error: string | null) => void;
}

export const useDigestStore = create<DigestState>((set) => ({
  digests: [],
  currentDigest: null,
  isLoading: false,
  error: null,

  loadDigests: async () => {
    try {
      set({ isLoading: true, error: null });
      const result = await window.electron.digest.list();

      if (result.success && result.data) {
        set({ digests: result.data as DigestListItem[] });
      } else {
        set({ error: result.error || 'Failed to load digests' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadDigest: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const result = await window.electron.digest.get(id);

      if (result.success && result.data) {
        set({ currentDigest: result.data as DigestData });
      } else {
        set({ error: result.error || 'Failed to load digest' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  saveDigest: async (digest: DigestData) => {
    try {
      set({ isLoading: true, error: null });
      const result = await window.electron.digest.save(digest);

      if (result.success) {
        // 重新加载列表
        const listResult = await window.electron.digest.list();
        if (listResult.success && listResult.data) {
          set({ digests: listResult.data as DigestListItem[] });
        }
      } else {
        set({ error: result.error || 'Failed to save digest' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDigest: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const result = await window.electron.digest.delete(id);

      if (result.success) {
        set((state) => ({
          digests: state.digests.filter((d) => d.id !== id),
          currentDigest: state.currentDigest?.id === id ? null : state.currentDigest,
        }));
      } else {
        set({ error: result.error || 'Failed to delete digest' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateDigest: async (digest: DigestData) => {
    try {
      set({ isLoading: true, error: null });
      const result = await window.electron.digest.update(digest);

      if (result.success) {
        set((state) => ({
          currentDigest: state.currentDigest?.id === digest.id ? digest : state.currentDigest,
        }));

        // 重新加载列表
        const listResult = await window.electron.digest.list();
        if (listResult.success && listResult.data) {
          set({ digests: listResult.data as DigestListItem[] });
        }
      } else {
        set({ error: result.error || 'Failed to update digest' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  searchDigests: async (params: SearchParams) => {
    try {
      set({ isLoading: true, error: null });
      const result = await window.electron.digest.search(params);

      if (result.success && result.data) {
        set({ digests: result.data as DigestListItem[] });
      } else {
        set({ error: result.error || 'Failed to search digests' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentDigest: (digest) => set({ currentDigest: digest }),
  setError: (error) => set({ error }),
}));
