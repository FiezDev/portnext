'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RELATED_WORDS } from '../shared/motto';
import {
  mulberry32,
  pickGameWords,
  pickDistinct,
  saveBest,
  loadBest,
  GAME_WORD_COUNT,
  GAME_TARGET_COUNT,
  GAME_MAX_LEN,
} from './heroGameLogic';

export const GAME_DURATION_S = 15;

export type GamePhase = 'idle' | 'playing' | 'over';

export interface HeroGame {
  phase: GamePhase;
  seed: number;
  score: number;
  streak: number;
  bestStreak: number;
  secondsLeft: number;
  targets: string[];
  best: number;
  hitWords: string[];
  /** Bumped on each wrong click so the cloud can trigger a one-shot shake. */
  lastWrong: { word: string; nonce: number } | null;
  start: () => void;
  quit: () => void;
  registerHit: (word: string) => void;
}

export function useHeroGame(): HeroGame {
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [seed, setSeed] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(GAME_DURATION_S);
  const [targets, setTargets] = useState<string[]>([]);
  const [best, setBest] = useState(0);
  const [hitWords, setHitWords] = useState<string[]>([]);
  const [lastWrong, setLastWrong] = useState<{ word: string; nonce: number } | null>(null);

  // Mutable mirror so registerHit can stay a stable, stale-closure-free callback.
  const g = useRef({
    phase: 'idle' as GamePhase,
    words: [] as string[],
    targets: [] as string[],
    hit: new Set<string>(),
    score: 0,
    streak: 0,
    bestStreak: 0,
    wrongNonce: 0,
    targetRng: mulberry32(1),
  });

  useEffect(() => {
    setBest(loadBest());
  }, []);

  const start = useCallback(() => {
    const newSeed = (Math.floor(Math.random() * 1_000_000_000) >>> 0) || 1;
    const words = pickGameWords(RELATED_WORDS, GAME_WORD_COUNT, mulberry32(newSeed), { maxLen: GAME_MAX_LEN });
    const targetRng = mulberry32((newSeed ^ 0x9e3779b9) >>> 0);
    const initial = pickDistinct(words, [], targetRng, GAME_TARGET_COUNT);

    g.current = {
      phase: 'playing',
      words,
      targets: initial,
      hit: new Set(),
      score: 0,
      streak: 0,
      bestStreak: 0,
      wrongNonce: 0,
      targetRng,
    };

    setSeed(newSeed);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setHitWords([]);
    setSecondsLeft(GAME_DURATION_S);
    setLastWrong(null);
    setTargets(initial);
    setPhase('playing');
  }, []);

  const quit = useCallback(() => {
    g.current.phase = 'idle';
    setPhase('idle');
  }, []);

  const registerHit = useCallback((word: string) => {
    const s = g.current;
    if (s.phase !== 'playing') return;
    if (s.hit.has(word)) return;

    if (s.targets.includes(word)) {
      s.hit.add(word);
      s.score += 1;
      s.streak += 1;
      s.bestStreak = Math.max(s.bestStreak, s.streak);

      // Replace the hit target with a fresh word so the target set stays full.
      let pool = s.words.filter((w) => !s.hit.has(w) && !s.targets.includes(w));
      if (pool.length === 0) {
        s.hit.clear();
        pool = s.words.filter((w) => !s.targets.includes(w));
      }
      const next = pool.length ? pickDistinct(pool, [], s.targetRng, 1)[0] : null;
      s.targets = s.targets.filter((t) => t !== word);
      if (next) s.targets.push(next);

      setScore(s.score);
      setStreak(s.streak);
      setBestStreak(s.bestStreak);
      setHitWords(Array.from(s.hit));
      setTargets([...s.targets]);
    } else {
      s.streak = 0;
      s.wrongNonce += 1;
      setStreak(0);
      setLastWrong({ word, nonce: s.wrongNonce });
    }
  }, []);

  // Countdown: a 1s tick for the visible number + one authoritative end timeout.
  useEffect(() => {
    if (phase !== 'playing') return;
    const tick = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    const end = setTimeout(() => {
      g.current.phase = 'over';
      setBest(saveBest(g.current.score));
      setPhase('over');
    }, GAME_DURATION_S * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(end);
    };
  }, [phase]);

  return {
    phase,
    seed,
    score,
    streak,
    bestStreak,
    secondsLeft,
    targets,
    best,
    hitWords,
    lastWrong,
    start,
    quit,
    registerHit,
  };
}
