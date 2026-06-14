import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripe() {
  if (stripeClient) return stripeClient

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined')
  }

  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  })

  return stripeClient
}
