'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GoldHeading from '@/components/portfolio/v2/shared/GoldHeading';

const BlogContent = () => {
  return (
    <main className="min-h-screen w-full seembg text-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-xl text-center flex flex-col items-center gap-6"
      >
        {/* Animated accent badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative"
        >
          <span className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
          <span className="relative flex items-center justify-center w-16 h-16 rounded-full border border-amber-400/40 bg-white/5">
            <PenLine className="w-7 h-7 text-amber-400" />
          </span>
        </motion.div>

        <GoldHeading as="h1" className="text-4xl md:text-5xl">
          Writing
        </GoldHeading>

        <p className="text-white/60 leading-relaxed">
          Notes on building things — case studies and engineering write-ups are
          on the way. I&apos;m putting together the first pieces now.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/work">
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              See my work in the meantime
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              className="border-white/20 bg-transparent text-white/80 hover:bg-white/10 hover:text-white gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
};

export default BlogContent;
