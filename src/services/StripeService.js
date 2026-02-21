/**
 * SilenceNow Stripe Integration - Revenue Pipeline
 * 
 * BUSINESS CRITICAL: Convert app users to paying customers
 * REVENUE MODEL: €19.99 Basic → €49.99 Premium → €99.99 Legal Action
 * CONVERSION STRATEGY: Immediate value → Payment → Delivery
 */

import { Platform } from 'react-native';

class StripeService {
  constructor() {
    this.stripePublicKey = 'pk_test_YOUR_STRIPE_PUBLIC_KEY'; // TODO: Add real key
    this.products = {
      basic_report: {
        name: 'Basis-Lärmprotokoll',
        description: 'Gerichtsfestes Beweisprotokoll für Vermieter',
        price: 1999, // €19.99 in cents
        priceId: 'price_basic_report',
        features: [
          'Chronologisches Lärmprotokoll',
          'Dezibel-Statistiken', 
          'Rechtliche Einordnung',
          'Muster-Beschwerde Brief'
        ]
      },
      premium_report: {
        name: 'Premium-Beweisdossier',
        description: 'Vollständige Dokumentation für Anwälte',
        price: 4999, // €49.99 in cents
        priceId: 'price_premium_report',
        features: [
          'Detailliertes Lärmprotokoll',
          'Juristische Analyse',
          'BGH-konforme Aufbereitung',
          'Mietminderungs-Berechnung',
          'Anwalts-Musterbriefe',
          '24/7 Chat Support'
        ]
      },
      legal_action: {
        name: 'Sofort-Durchsetzungs-Paket',
        description: 'Komplette Mietminderung sofort durchsetzen',
        price: 9999, // €99.99 in cents
        priceId: 'price_legal_action',
        features: [
          'Alle Premium-Features',
          'Anwalts-Vermittlung',
          'Erfolgs-Garantie*',
          'Express-Bearbeitung (24h)',
          'Telefonische Beratung'
        ]
      },
      subscription_basic: {
        name: 'SilenceNow Basic',
        description: 'Monatliche Berichte und erweiterte Features',
        price: 999, // €9.99/month in cents
        priceId: 'price_subscription_basic',
        interval: 'month'
      },
      subscription_premium: {
        name: 'SilenceNow Premium',
        description: 'Unlimited Berichte und Premium-Support',
        price: 1999, // €19.99/month in cents
        priceId: 'price_subscription_premium', 
        interval: 'month'
      }
    };
  }

  /**
   * Initialize Stripe payment for report purchase
   */
  async purchaseReport(reportType, userEmail, additionalData = {}) {
    const product = this.products[reportType];
    if (!product) {
      throw new Error('Invalid report type');
    }

    try {
      // Create payment session
      const paymentSession = await this.createPaymentSession({
        productId: reportType,
        price: product.price,
        userEmail,
        successUrl: 'silencenow://payment-success',
        cancelUrl: 'silencenow://payment-cancel',
        metadata: {
          reportType,
          userEmail,
          ...additionalData
        }
      });

      return paymentSession;
    } catch (error) {
      console.error('Payment creation failed:', error);
      throw error;
    }
  }

  /**
   * Create Stripe Checkout Session (server-side call needed)
   */
  async createPaymentSession(sessionData) {
    const endpoint = Platform.OS === 'web' 
      ? '/api/create-checkout-session'
      : 'https://your-backend.com/api/create-checkout-session';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      });

      const session = await response.json();
      
      if (!response.ok) {
        throw new Error(session.error || 'Payment session creation failed');
      }

      return session;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(sessionId, reportType) {
    try {
      // Verify payment with backend
      const verification = await this.verifyPayment(sessionId);
      
      if (verification.status === 'paid') {
        // Trigger report generation
        await this.fulfillOrder(reportType, verification.customerEmail);
        return { success: true, reportType };
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment handling failed:', error);
      throw error;
    }
  }

  /**
   * Verify payment status with backend
   */
  async verifyPayment(sessionId) {
    const endpoint = Platform.OS === 'web'
      ? '/api/verify-payment'
      : 'https://your-backend.com/api/verify-payment';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId })
    });

    return await response.json();
  }

  /**
   * Fulfill order after successful payment
   */
  async fulfillOrder(reportType, customerEmail) {
    // This would trigger:
    // 1. Report generation
    // 2. Email delivery
    // 3. Database updates
    // 4. User tier upgrade
    
    console.log(`Fulfilling order: ${reportType} for ${customerEmail}`);
    
    // TODO: Integrate with your fulfillment system
    return { fulfilled: true };
  }

  /**
   * Get pricing information for display
   */
  getPricingInfo() {
    return Object.entries(this.products).map(([key, product]) => ({
      id: key,
      name: product.name,
      description: product.description,
      price: product.price,
      priceDisplay: this.formatPrice(product.price),
      features: product.features,
      interval: product.interval
    }));
  }

  /**
   * Format price for display
   */
  formatPrice(priceInCents) {
    const euros = priceInCents / 100;
    return `€${euros.toFixed(2).replace('.', ',')}`;
  }

  /**
   * Calculate discount for bundle purchases
   */
  calculateBundleDiscount(reportTypes) {
    const totalPrice = reportTypes.reduce((sum, type) => {
      return sum + (this.products[type]?.price || 0);
    }, 0);

    // 20% discount for multiple reports
    if (reportTypes.length > 1) {
      const discount = Math.round(totalPrice * 0.2);
      return {
        originalPrice: totalPrice,
        discount: discount,
        finalPrice: totalPrice - discount,
        discountPercentage: 20
      };
    }

    return {
      originalPrice: totalPrice,
      discount: 0,
      finalPrice: totalPrice,
      discountPercentage: 0
    };
  }

  /**
   * Create subscription for recurring users
   */
  async createSubscription(planType, userEmail, trialDays = 7) {
    const product = this.products[`subscription_${planType}`];
    if (!product) {
      throw new Error('Invalid subscription plan');
    }

    try {
      const subscriptionSession = await this.createPaymentSession({
        productId: `subscription_${planType}`,
        price: product.price,
        userEmail,
        mode: 'subscription',
        trialPeriodDays: trialDays,
        successUrl: 'silencenow://subscription-success',
        cancelUrl: 'silencenow://subscription-cancel',
        metadata: {
          planType,
          userEmail,
          trialDays
        }
      });

      return subscriptionSession;
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    const endpoint = Platform.OS === 'web'
      ? '/api/cancel-subscription'
      : 'https://your-backend.com/api/cancel-subscription';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Subscription cancellation failed:', error);
      throw error;
    }
  }

  /**
   * Get customer's purchase history
   */
  async getPurchaseHistory(userEmail) {
    const endpoint = Platform.OS === 'web'
      ? '/api/purchase-history'
      : 'https://your-backend.com/api/purchase-history';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail })
      });

      const history = await response.json();
      return history;
    } catch (error) {
      console.error('Purchase history retrieval failed:', error);
      return [];
    }
  }

  /**
   * Apply promo code
   */
  async applyPromoCode(code, productId) {
    // Common promo codes for SilenceNow
    const promoCodes = {
      'ERSTEMIETE': { discount: 50, type: 'percentage' }, // 50% off first purchase
      'RUHEZEIT': { discount: 1000, type: 'fixed' }, // €10 off
      'NACHBAR': { discount: 25, type: 'percentage' }, // 25% off
      'LEGAL2024': { discount: 30, type: 'percentage' }, // 30% off legal reports
    };

    const promo = promoCodes[code.toUpperCase()];
    if (!promo) {
      throw new Error('Ungültiger Promo-Code');
    }

    const product = this.products[productId];
    let discountAmount = 0;

    if (promo.type === 'percentage') {
      discountAmount = Math.round((product.price * promo.discount) / 100);
    } else {
      discountAmount = promo.discount;
    }

    return {
      valid: true,
      discountAmount,
      finalPrice: Math.max(0, product.price - discountAmount),
      promoCode: code,
      description: `${promo.discount}${promo.type === 'percentage' ? '%' : '€'} Rabatt`
    };
  }
}

export default new StripeService();