import { spawn } from 'node:child_process'

export type AuthMethod = 'gh-cli' | 'token' | 'none'

export interface AuthResult {
	method: AuthMethod
	token: string | null
}

async function execCommand(command: string, args: string[]): Promise<string> {
	return new Promise((resolve, reject) => {
		const proc = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] })
		let stdout = ''
		let stderr = ''

		proc.stdout.on('data', (data: Buffer) => {
			stdout += data.toString()
		})
		proc.stderr.on('data', (data: Buffer) => {
			stderr += data.toString()
		})

		proc.on('close', (code) => {
			if (code === 0) {
				resolve(stdout.trim())
			} else {
				reject(new Error(stderr || `Command failed with code ${code}`))
			}
		})

		proc.on('error', (err) => {
			reject(err)
		})
	})
}

export async function getGhCliToken(): Promise<string | null> {
	try {
		const token = await execCommand('gh', ['auth', 'token'])
		return token || null
	} catch {
		return null
	}
}

export async function isGhCliAvailable(): Promise<boolean> {
	try {
		await execCommand('gh', ['--version'])
		return true
	} catch {
		return false
	}
}

export async function detectAuth(): Promise<AuthResult> {
	// Priority 1: GITHUB_TOKEN environment variable
	const envToken = process.env['GITHUB_TOKEN'] || process.env['GH_TOKEN']
	if (envToken) {
		return { method: 'token', token: envToken }
	}

	// Priority 2: gh CLI auth
	const ghToken = await getGhCliToken()
	if (ghToken) {
		return { method: 'gh-cli', token: ghToken }
	}

	return { method: 'none', token: null }
}

export async function getToken(): Promise<string> {
	const auth = await detectAuth()
	if (!auth.token) {
		throw new AuthError(
			'No GitHub authentication found. Either:\n' +
				'  1. Set GITHUB_TOKEN environment variable\n' +
				'  2. Run `gh auth login` to authenticate with GitHub CLI'
		)
	}
	return auth.token
}

export async function validateToken(token: string): Promise<boolean> {
	try {
		const response = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
			},
		})
		return response.ok
	} catch {
		return false
	}
}

export async function getAuthStatus(): Promise<{
	method: AuthMethod
	valid: boolean
	username?: string
	scopes?: string[]
}> {
	const auth = await detectAuth()

	if (!auth.token) {
		return { method: 'none', valid: false }
	}

	try {
		const response = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${auth.token}`,
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
			},
		})

		if (!response.ok) {
			return { method: auth.method, valid: false }
		}

		const user = (await response.json()) as { login: string }
		const scopesHeader = response.headers.get('x-oauth-scopes')
		const scopes = scopesHeader ? scopesHeader.split(', ').filter(Boolean) : []

		return {
			method: auth.method,
			valid: true,
			username: user.login,
			scopes,
		}
	} catch {
		return { method: auth.method, valid: false }
	}
}

export class AuthError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'AuthError'
	}
}
