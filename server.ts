import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import firebaseConfig from './firebase-applet-config.json' with { type: "json" };

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // This works in Cloud Run
    projectId: firebaseConfig.projectId
  });
}

const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe initialization (Lazy)
  let stripe: Stripe | null = null;
  const getStripe = () => {
    if (!stripe && process.env.STRIPE_SECRET_KEY) {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripe;
  };

  // 1. Webhook MUST come before express.json() to handle raw body
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const stripeClient = getStripe();

    if (!stripeClient || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.log('Webhook received (Unchecked - Secrets missing)');
      return res.status(200).send('Webhook processed (Mock)');
    }

    let event;

    try {
      event = stripeClient.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { userId, tier } = paymentIntent.metadata;
      
      console.log(`💰 Payment Succeeded for User ${userId}, Tier: ${tier}`);
      
      if (userId && tier) {
        try {
          await db.collection('userProfiles').doc(userId).update({
            subscriptionTier: tier,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`✅ Profile updated: ${userId} -> ${tier}`);
        } catch (error) {
          console.error('❌ Error updating profile via Firebase Admin:', error);
        }
      }
    }

    res.json({ received: true });
  });

  // 2. Global JSON middleware for other routes
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  // Create Payment Intent
  app.post('/api/create-payment-intent', async (req, res) => {
    const { amount, tier, userId } = req.body;

    const stripeClient = getStripe();
    
    if (!stripeClient) {
      console.warn('STRIPE_SECRET_KEY is missing. Returning mock payment intent.');
      return res.json({ 
        clientSecret: 'mock_secret_' + Math.random().toString(36).substring(7),
        isMock: true 
      });
    }

    try {
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(amount * 100), // Amount in cents
        currency: 'eur',
        metadata: { tier, userId },
        automatic_payment_methods: { enabled: true },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Stripe Error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AURORA_EMBER_SERVER live on http://localhost:${PORT}`);
  });
}

startServer();
