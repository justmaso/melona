import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User } from "@/models"
import { setAuthToken } from "../api"
import { UserService } from "../services/user"

interface AuthState {
    user: User | null
    token: string | null
    interfaceRole: User["role"] | null
    hydrated: boolean
    login: (token: string, user: User) => void
    logout: () => void
    switchInterface: (role: User["role"]) => void
    updateUser: (user: User) => void
    refreshUser: () => Promise<void>
    setHydrated: () => void
}

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            interfaceRole: null,
            hydrated: false,

            login: (token, user) => {
                setAuthToken(token)
                set({ user, token })
            },

            logout: () => {
                setAuthToken(null)
                set({ user: null, token: null, interfaceRole: null })
            },

            switchInterface: (role) => set({ interfaceRole: role }),

            updateUser: (user) => set({ user }),

            refreshUser: async () => {
                try {
                    const response = await UserService.me()
                    set({ user: response.data })
                } catch (error) {
                    console.error("Failed to refresh user:", error)
                }
            },

            setHydrated: () => set({ hydrated: true })
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                interfaceRole: state.interfaceRole
            }),
            onRehydrateStorage: () => (state) => {
                if (state?.token) {
                    setAuthToken(state.token)
                }
                
                // hydrate the state on reload
                state?.setHydrated()
            } 
        }
    )
)