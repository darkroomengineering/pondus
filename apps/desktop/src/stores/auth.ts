import { create } from 'zustand'
import { Command } from '@tauri-apps/plugin-shell'

interface AuthState {
	isAuthenticated: boolean
	isLoading: boolean
	username: string | null
	error: string | null
	checkAuth: () => Promise<void>
	getToken: () => Promise<string | null>
}

export const useAuthStore = create<AuthState>((set, get) => ({
	isAuthenticated: false,
	isLoading: true,
	username: null,
	error: null,

	checkAuth: async () => {
		set({ isLoading: true, error: null })

		try {
			// Check if gh CLI is available and authenticated
			// Uses explicit command name from capabilities/default.json
			const tokenCmd = Command.create('gh-auth-token')
			const tokenResult = await tokenCmd.execute()

			if (tokenResult.code !== 0 || !tokenResult.stdout.trim()) {
				set({
					isAuthenticated: false,
					isLoading: false,
					username: null,
					error: 'Not authenticated with GitHub CLI',
				})
				return
			}

			const token = tokenResult.stdout.trim()

			// Validate token and get username
			const response = await fetch('https://api.github.com/user', {
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: 'application/vnd.github+json',
				},
			})

			if (!response.ok) {
				set({
					isAuthenticated: false,
					isLoading: false,
					username: null,
					error: 'Invalid or expired token',
				})
				return
			}

			const user = (await response.json()) as { login: string }
			set({
				isAuthenticated: true,
				isLoading: false,
				username: user.login,
				error: null,
			})
		} catch (err) {
			set({
				isAuthenticated: false,
				isLoading: false,
				username: null,
				error: err instanceof Error ? err.message : 'Failed to check authentication',
			})
		}
	},

	getToken: async () => {
		try {
			const cmd = Command.create('gh-auth-token')
			const result = await cmd.execute()
			if (result.code === 0 && result.stdout.trim()) {
				return result.stdout.trim()
			}
			return null
		} catch {
			return null
		}
	},
}))
