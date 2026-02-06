import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/services/auth'
import { setToken, removeToken } from '@/services/api'
import type { User, LoginRequest, RegisterRequest } from '@/types/user'

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  loading: boolean

  // Actions
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      loading: false,

      login: async (data: LoginRequest) => {
        set({ loading: true })
        try {
          const res = await authApi.login(data)
          setToken(res.access_token)
          set({
            user: res.user,
            isLoggedIn: true,
            loading: false,
          })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      register: async (data: RegisterRequest) => {
        set({ loading: true })
        try {
          const res = await authApi.register(data)
          setToken(res.access_token)
          set({
            user: res.user,
            isLoggedIn: true,
            loading: false,
          })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      logout: () => {
        removeToken()
        set({
          user: null,
          isLoggedIn: false,
        })
      },

      fetchMe: async () => {
        try {
          const user = await authApi.getMe()
          set({ user, isLoggedIn: true })
        } catch {
          removeToken()
          set({ user: null, isLoggedIn: false })
        }
      },

      setUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: 'man-auth',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)
