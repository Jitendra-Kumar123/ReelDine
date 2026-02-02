const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  async createPaymentIntent(amount, currency = 'usd') {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: currency,
        payment_method_types: ['card'],
      });
      return paymentIntent;
    } catch (error) {
      throw new Error('Payment intent creation failed: ' + error.message);
    }
  }

  async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });
      return paymentIntent;
    } catch (error) {
      throw new Error('Payment confirmation failed: ' + error.message);
    }
  }

  async createSubscription(priceId, customerId) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      throw new Error('Subscription creation failed: ' + error.message);
    }
  }
}

const paymentService = new PaymentService();

module.exports = paymentService;
