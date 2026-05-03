'use client';

import { Canvas } from '@react-three/fiber';
import { Preload, Stats } from '@react-three/drei';
import { Suspense, useState } from 'react';
import type { PageId } from '../shared/pages';
import SceneController from './SceneController';

interface StageProps {
  currentPage: PageId;
  previousPage?: PageId;
}

const Stage = ({ currentPage, previousPage }: StageProps) => {
  const [contextKey, setContextKey] = useState(0);
  const showStats =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('stats') === '1';

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <Canvas
        key={contextKey}
        dpr={[1, 1.75]}
        frameloop="demand"
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6], fov: 50 }}
        className="!pointer-events-auto"
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('[v2] WebGL context lost; remounting Canvas');
            setContextKey((n) => n + 1);
          });
        }}
      >
        <Suspense fallback={null}>
          <SceneController currentPage={currentPage} previousPage={previousPage} />
          <Preload all />
        </Suspense>
        {showStats && <Stats className="!left-2 !top-auto !bottom-2" />}
      </Canvas>
    </div>
  );
};

export default Stage;
