import { create } from 'zustand';
import { SAMMData } from '@/types/samm';

interface SAMMStore {
  sammData: SAMMData | null;
  setSAMMData: (data: SAMMData) => void;
  relayer: string;
  setRelayer: (relayer: string) => void;
  token: string;
  setToken: (token: string) => void;
  allSAMMs: SAMMData[];
  setAllSAMMs: (data: SAMMData[]) => void;
  disabledSAMMs: SAMMData[];
  setDisabledSAMMs: (data: SAMMData[]) => void;
  isSafeApp: boolean | null;
  setIsSafeApp: (isSafeApp: boolean) => void;
}

export const useSAMMStore = create<SAMMStore>((set) => ({
  sammData: null,
  setSAMMData: (data) => set({ sammData: data }),
  relayer: '',
  setRelayer: (relayer) => set({ relayer }),
  token: '',
  setToken: (token) => set({ token }),
  allSAMMs: [],
  setAllSAMMs: (data) => set({ allSAMMs: data }),
  disabledSAMMs: [],
  setDisabledSAMMs: (data) => set({ disabledSAMMs: data }),
  isSafeApp: null,

  setIsSafeApp: (bool) => set({ isSafeApp: bool }),
}));
