import { create } from "zustand";
import { FileTreeItem } from "~/server/api/routers/user";

interface FileTreeStore {
  fileTree: FileTreeItem[];
  setFileTree: (fileTree: FileTreeItem[]) => void;
}

export const useFileTree = create<FileTreeStore>((set) => ({
  fileTree: [],
  setFileTree: (fileTree) => set({ fileTree }),
}));
