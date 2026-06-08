import { create } from 'zustand';

// For demo purposes, we'll mock the login since the gateway doesn't have a direct login endpoint in this scope yet.
export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  login: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  }
}));
