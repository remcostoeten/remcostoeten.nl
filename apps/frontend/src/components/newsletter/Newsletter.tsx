"use client";

import React, { useState, memo, useCallback } from 'react';
import { Mail } from 'lucide-react';

const Newsletter = memo(function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset form
    setEmail('');
    setIsSubmitting(false);
    
    // You would typically send this to your newsletter service
    console.log('Newsletter signup:', email);
  }, [email]);

  return (
    <section className="py-16" id="newsletter">
      <div className="bg-stone-700/30 rounded-2xl p-8 border border-stone-600/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-white">Newsletter</h2>
          <span className="text-stone-400 text-sm font-medium">300+ Readers</span>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@framer.com"
                required
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-stone-800 border border-stone-600/50
                  text-white placeholder-stone-400
                  focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50
                  transition-all duration-200
                "
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                px-6 py-3 rounded-xl
                bg-stone-800 hover:bg-stone-700 border border-stone-600/50
                text-white font-medium
                transition-all duration-200 hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2
              "
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  ↵ Subscribe
                </>
              )}
            </button>
          </div>
        </form>
        
        <p style={{ fontSize: '16px', color: '#aba9a7', lineHeight: '1.7' }}>
          Love design, tech, and random thoughts? Subscribe to my newsletter — it's like a good chat, in your inbox!
        </p>
      </div>
    </section>
  );
});

export { Newsletter };