'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame } from 'lucide-react';
import { formatTime } from './heroGameLogic';
import type { GamePhase } from './useHeroGame';

interface GameHUDProps {
  phase: GamePhase;
  secondsLeft: number;
  durationS: number;
  score: number;
  streak: number;
  bestStreak: number;
  best: number;
  target: string;
  /** Changes each game so the timer bar restarts its CSS animation. */
  runKey: number;
  onQuit: () => void;
  onPlayAgain: () => void;
}

export default function GameHUD({
  phase,
  secondsLeft,
  durationS,
  score,
  streak,
  bestStreak,
  best,
  target,
  runKey,
  onQuit,
  onPlayAgain,
}: GameHUDProps) {
  const urgent = secondsLeft <= 5;

  return (
    <div className="absolute inset-0 z-40 select-none pointer-events-none">
      {/* Top bar: score + timer + streak + quit */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 md:p-6">
        <div className="max-w-md flex-1">
          <div className="mb-1 flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-700">
              SCORE <span className="text-yellow-700">{score}</span>
            </span>
            <span className={urgent ? 'text-red-500' : 'text-gray-700'}>
              {formatTime(secondsLeft)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200/70">
            <motion.div
              key={runKey}
              className={`h-full rounded-full ${urgent ? 'bg-red-500' : 'bg-yellow-500'}`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: durationS, ease: 'linear' }}
            />
          </div>
          {streak > 1 && (
            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-yellow-600">
              <Flame className="h-3 w-3" /> {streak} streak
            </div>
          )}
        </div>
        <button
          onClick={onQuit}
          aria-label="Quit game"
          className="pointer-events-auto rounded-full bg-white/70 p-2 text-gray-600 shadow transition-colors hover:bg-white hover:text-gray-900"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Target pill, bottom-center */}
      {phase === 'playing' && (
        <div className="absolute inset-x-0 bottom-8 flex justify-center px-4">
          <motion.div
            key={target}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="rounded-full bg-[#1A1A1A] px-6 py-3 shadow-xl"
            role="status"
            aria-live="polite"
            aria-label={`Find ${target}`}
          >
            <span className="mr-2 text-xs uppercase tracking-widest text-gray-400">Find</span>
            <span className="text-lg font-extrabold tracking-wider text-yellow-400">{target}</span>
          </motion.div>
        </div>
      )}

      {/* End screen */}
      <AnimatePresence>
        {phase === 'over' && (
          <motion.div
            className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="mx-4 w-full max-w-xs rounded-2xl border border-gray-200 bg-white px-8 py-7 text-center shadow-2xl"
              role="status"
              aria-live="polite"
              aria-label={`Time! You found ${score} words. Best ${Math.max(best, score)}.`}
            >
              <div className="text-sm uppercase tracking-widest text-gray-400">Time!</div>
              <div className="mt-1 text-6xl font-extrabold text-yellow-600">{score}</div>
              <div className="text-sm text-gray-500">
                words found
                {bestStreak > 1 ? ` · best streak ${bestStreak}` : ''}
              </div>
              <div className="mt-1 text-xs text-gray-400">Best: {Math.max(best, score)}</div>
              <div className="mt-5 flex justify-center gap-2">
                <button
                  onClick={onPlayAgain}
                  className="rounded-full bg-yellow-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-yellow-600"
                >
                  Play again
                </button>
                <button
                  onClick={onQuit}
                  className="rounded-full bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
