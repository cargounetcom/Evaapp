import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

interface StripePaymentProps {
  amount: number;
  tier: string;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function StripePaymentOverlay({ amount, tier, userId, onClose, onSuccess }: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, tier, userId }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [amount, tier, userId]);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-pop-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white border-4 border-pop-black w-full max-w-md p-8 relative shadow-[12px_12px_0px_0px_white]"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 transition-colors border-2 border-pop-black"
          >
            <X size={20} />
          </button>

          <div className="mb-8">
            <h3 className="font-pop text-3xl text-pop-black uppercase italic">SECURE_PAYMENT</h3>
            <p className="font-mono text-xs text-gray-500">Tier: {tier.toUpperCase()} // Amount: €{amount}</p>
          </div>

          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm onSuccess={onSuccess} />
            </Elements>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="animate-spin text-pop-cyan" size={40} />
              <p className="font-mono text-[10px] text-gray-400">INITIATING_SECURE_TUNNEL...</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'An unexpected error occurred.');
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{
        layout: 'tabs',
      }} />
      
      {error && (
        <div className="bg-red-50 border-2 border-red-500 p-3 text-red-500 font-mono text-[10px] uppercase">
          {error}
        </div>
      )}

      <button
        disabled={processing || !stripe}
        className="w-full bg-pop-black text-white p-4 font-pop text-xl italic hover:bg-pop-pink transition-all shadow-[4px_4px_0px_0px_#00FFFF] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'UPLINKING...' : 'CONFIRM_PAYMENT'}
      </button>
      
      <p className="text-[8px] text-center font-mono text-gray-400 uppercase">
        Secure encryption via Stripe Cyber-Protocol. We never store your card data.
      </p>
    </form>
  );
}
