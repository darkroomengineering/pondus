import { Webhooks } from '@polar-sh/nextjs'

export const POST = Webhooks({
	webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

	onOrderPaid: async (payload) => {
		// Handle successful payment
		console.log('Order paid:', payload.data.id)
		console.log('Customer:', payload.data.customer?.email)
		console.log('Product:', payload.data.product?.name)

		// TODO: Store in database, send confirmation email, etc.
	},

	onSubscriptionCreated: async (payload) => {
		// Handle new subscription
		console.log('Subscription created:', payload.data.id)
		console.log('Customer:', payload.data.customer?.email)

		// TODO: Grant access, update user record, etc.
	},

	onSubscriptionUpdated: async (payload) => {
		// Handle subscription changes (upgrade, downgrade, renewal)
		console.log('Subscription updated:', payload.data.id)
		console.log('Status:', payload.data.status)

		// TODO: Update user's subscription status
	},

	onSubscriptionCanceled: async (payload) => {
		// Handle cancellation
		console.log('Subscription canceled:', payload.data.id)

		// TODO: Revoke access, send win-back email, etc.
	},
})
