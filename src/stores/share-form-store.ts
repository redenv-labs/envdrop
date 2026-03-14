import { create } from "zustand";

export type ExpiryOption = "1h" | "24h" | "3d";

interface ShareFormState {
  // Input
  mode: "text" | "file";
  secret: string;
  file: File | null;

  // Options
  burnAfterRead: boolean;
  expiry: ExpiryOption;
  usePassword: boolean;
  password: string;
  showPassword: boolean;

  // Result
  shareLink: string;

  // Actions
  setMode: (mode: "text" | "file") => void;
  setSecret: (secret: string) => void;
  setFile: (file: File | null) => void;
  setBurnAfterRead: (value: boolean) => void;
  setExpiry: (value: ExpiryOption) => void;
  setUsePassword: (value: boolean) => void;
  setPassword: (value: string) => void;
  toggleShowPassword: () => void;
  setShareLink: (link: string) => void;
  reset: () => void;
}

const initialState = {
  mode: "text" as const,
  secret: "",
  file: null as File | null,
  burnAfterRead: true,
  expiry: "24h" as ExpiryOption,
  usePassword: false,
  password: "",
  showPassword: false,
  shareLink: "",
};

export const useShareFormStore = create<ShareFormState>((set) => ({
  ...initialState,

  setMode: (mode) => set({ mode }),
  setSecret: (secret) => set({ secret }),
  setFile: (file) => set({ file }),
  setBurnAfterRead: (burnAfterRead) => set({ burnAfterRead }),
  setExpiry: (expiry) => set({ expiry }),
  setUsePassword: (value) =>
    set({ usePassword: value, ...(value ? {} : { password: "" }) }),
  setPassword: (password) => set({ password }),
  toggleShowPassword: () =>
    set((state) => ({ showPassword: !state.showPassword })),
  setShareLink: (shareLink) => set({ shareLink }),
  reset: () => set(initialState),
}));
