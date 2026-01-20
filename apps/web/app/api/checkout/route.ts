import { Checkout } from '@polar-sh/nextjs'

const accessToken = process.env.POLAR_ACCESS_TOKEN
if (!accessToken) {
	throw new Error('POLAR_ACCESS_TOKEN environment variable is required')
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL
if (!appUrl) {
	throw new Error('NEXT_PUBLIC_APP_URL environment variable is required')
}

export const GET = Checkout({
	accessToken,
	successUrl: `${appUrl}/success`,
	server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
})
