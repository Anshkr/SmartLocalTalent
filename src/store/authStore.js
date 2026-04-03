import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (data) => set((s) => ({ user: { ...s.user, ...data } })),
      getToken: () => get().token,
    }),
    { name: 'smarttalent-auth' }
  )
)

export default useAuthStore