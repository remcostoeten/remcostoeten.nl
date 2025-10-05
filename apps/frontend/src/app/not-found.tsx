'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Center } from '@/shared/components/center';

export default function NotFound() {
  return (
    <Center fullHeight className="bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center space-y-8 max-w-md"
      >
        {/* 404 Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative"
        >
          <div className="text-8xl font-bold text-foreground mb-4 select-none">
            4
            <motion.span
              animate={{
                rotateY: [0, 90, 180, 270, 360],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut',
              }}
              className="inline-block"
            >
              0
            </motion.span>
            4
          </div>

          {/* Animated background glow */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 -z-10 bg-accent/20 rounded-full blur-xl"
          />
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Oops! Page Not Found
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            The page you're looking for seems to have wandered off into the digital void.
            Don't worry, it happens to the best of us.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="group">
            <Link href="/">
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Back to Home
            </Link>
          </Button>

          <Button variant="outline" size="lg" asChild className="group">
            <Link href="/posts">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Browse Posts
            </Link>
          </Button>
        </motion.div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="pt-8 border-t border-border/50"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Search className="w-4 h-4" />
            <span>Looking for something specific?</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link
              href="/posts"
              className="p-3 bg-card border border-border rounded-lg hover:bg-accent/5 hover:border-accent/20 transition-colors"
            >
              <div className="font-medium text-foreground">Blog Posts</div>
              <div className="text-muted-foreground text-xs">Latest articles</div>
            </Link>

            <Link
              href="/contact"
              className="p-3 bg-card border border-border rounded-lg hover:bg-accent/5 hover:border-accent/20 transition-colors"
            >
              <div className="font-medium text-foreground">Contact</div>
              <div className="text-muted-foreground text-xs">Get in touch</div>
            </Link>
          </div>
        </motion.div>

        {/* Fun Easter Egg */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-xs text-muted-foreground/60 pt-4"
        >
          <p className="italic">
            "404: The page you're looking for is currently exploring other dimensions."
          </p>
        </motion.div>
      </motion.div>
    </Center>
  );
}
