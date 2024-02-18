import { Post } from "contentlayer/generated";
import { create } from "zustand";

interface UseSearchModal {
  posts?: Post[] | undefined;
  isOpen: boolean;
  onOpen: (posts: Post[]) => void;
  onClose: () => void;
}

export const useSearchModal = create<UseSearchModal>((set) => ({
  isOpen: false,
  posts: undefined,
  onOpen: (posts: Post[]) => set({ isOpen: true, posts }),
  onClose: () => set({ isOpen: false, posts: undefined }),
}));
