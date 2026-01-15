import { CustomerPortal } from '@polar-sh/nextjs'

export const GET = CustomerPortal({
	accessToken: process.env.POLAR_ACCESS_TOKEN!,
	server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
	getCustomerId: async (req) => {
		// In production, get customer ID from session/auth
		const { searchParams } = new URL(req.url)
		const customerId = searchParams.get('customerId')

		if (!customerId) {
			throw new Error('Customer ID required')
		}

		return customerId
	},
})
