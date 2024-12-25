import { create } from 'zustand';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
}

interface BlogState {
  posts: BlogPost[];
  setPosts: (posts: BlogPost[]) => void;
  addPost: (post: BlogPost) => void;
  removePost: (id: string) => void;
}

export const useBlogStore = create<BlogState>((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [...state.posts, post] })),
  removePost: (id) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== id),
    })),
}));