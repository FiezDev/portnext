'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import type { PageId } from '../shared/pages';
import SceneController from './SceneController';

interface StageProps {
  currentPage: PageId;
  previousPage?: PageId;
}

const Stage = ({ currentPage, previousPage }: StageProps) => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <Canvas
        dpr={[1, 1.75]}
        frameloop="demand"
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6], fov: 50 }}
        className="!pointer-events-auto"
      >
        <Suspense fallback={null}>
          <SceneController currentPage={currentPage} previousPage={previousPage} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Stage;
