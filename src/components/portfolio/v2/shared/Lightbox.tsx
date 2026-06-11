'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LightboxProps {
  images: string[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  alt?: string;
}

const MIN = 1;
const MAX = 4;

const Lightbox = ({
  images,
  index,
  open,
  onClose,
  onIndexChange,
  alt,
}: LightboxProps) => {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(
    null
  );
  const pinch = useRef<{ dist: number; scale: number } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const reset = useCallback(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const go = useCallback(
    (dir: number) => onIndexChange((index + dir + images.length) % images.length),
    [index, images.length, onIndexChange]
  );

  // reset transform whenever the shown image changes or the lightbox opens
  useEffect(() => {
    reset();
  }, [index, open, reset]);

  // keyboard + body-scroll lock + initial focus
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === '+' || e.key === '=') setScale((s) => Math.min(MAX, s + 0.5));
      else if (e.key === '-') setScale((s) => Math.max(MIN, s - 0.5));
    };
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, go, onClose]);

  if (!open || images.length === 0 || typeof document === 'undefined')
    return null;

  const zoomIn = () => setScale((s) => Math.min(MAX, s + 0.5));
  const zoomOut = () =>
    setScale((s) => {
      const n = Math.max(MIN, s - 0.5);
      if (n === 1) setPos({ x: 0, y: 0 });
      return n;
    });

  const onWheel = (e: React.WheelEvent) =>
    setScale((s) => Math.min(MAX, Math.max(MIN, s - e.deltaY * 0.0025)));

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPos({
      x: drag.current.px + (e.clientX - drag.current.x),
      y: drag.current.py + (e.clientY - drag.current.y),
    });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinch.current = { dist: Math.hypot(dx, dy), scale };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinch.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const ratio = Math.hypot(dx, dy) / pinch.current.dist;
      setScale(Math.min(MAX, Math.max(MIN, pinch.current.scale * ratio)));
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) pinch.current = null;
  };

  const iconBtn =
    'w-10 h-10 rounded-full bg-white/10 hover:bg-yellow-500/80 text-white flex items-center justify-center transition-colors backdrop-blur';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot viewer"
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Controls */}
      <div
        className="absolute top-3 right-3 z-10 flex gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button aria-label="Zoom out" onClick={zoomOut} className={iconBtn}>
          <ZoomOut className="w-5 h-5" />
        </button>
        <button aria-label="Zoom in" onClick={zoomIn} className={iconBtn}>
          <ZoomIn className="w-5 h-5" />
        </button>
        <button aria-label="Reset zoom" onClick={reset} className={iconBtn}>
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          ref={closeRef}
          aria-label="Close"
          onClick={onClose}
          className={iconBtn}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image stage */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt={alt ? `${alt} ${index + 1}` : `Screenshot ${index + 1}`}
          draggable={false}
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            cursor: scale > 1 ? 'grab' : 'zoom-in',
          }}
          className="max-w-[94vw] max-h-[86vh] object-contain select-none transition-transform duration-75"
          onDoubleClick={() => (scale > 1 ? reset() : setScale(2))}
        />
      </div>

      {/* Image nav */}
      {images.length > 1 && (
        <>
          <button
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className={cn(iconBtn, 'absolute left-3 top-1/2 -translate-y-1/2')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className={cn(iconBtn, 'absolute right-3 top-1/2 -translate-y-1/2')}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80 bg-black/40 rounded-full px-3 py-1">
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </div>,
    document.body
  );
};

export default Lightbox;
