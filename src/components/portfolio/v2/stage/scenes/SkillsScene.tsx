'use client';

import { forwardRef, useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import throttle from 'lodash.throttle';
import IconBillboard from '../primitives/IconBillboard';
import { coreicon } from '@/constants/mapdata';

function fibonacciSphere(n: number, radius: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2; // y goes from 1 to -1
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    pts.push([radius * r * Math.cos(theta), radius * y, radius * r * Math.sin(theta)]);
  }
  return pts;
}

const SkillsScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => {
  const innerRef = useRef<Group>(null);
  const invalidate = useThree(s => s.invalidate);
  const positions = useMemo(() => fibonacciSphere(coreicon.length, 1.6), []);

  // pointer-drag spin state
  const dragging = useRef(false);
  const lastX = useRef(0);
  const velocity = useRef(0);

  useEffect(() => {
    const onDown = (e: PointerEvent) => { dragging.current = true; lastX.current = e.clientX; };
    const onMove = throttle((e: PointerEvent) => {
      if (!dragging.current || !innerRef.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      velocity.current = dx * 0.005;
      innerRef.current.rotation.y += velocity.current;
      invalidate();
    }, 16);
    const onUp = () => { dragging.current = false; };

    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      onMove.cancel();
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [invalidate]);

  useFrame((_, dt) => {
    if (!visible || !innerRef.current) return;
    if (!dragging.current) {
      // idle rotation
      innerRef.current.rotation.y += 0.05 * dt;
      // momentum decay
      if (Math.abs(velocity.current) > 0.0001) {
        innerRef.current.rotation.y += velocity.current;
        velocity.current *= 0.92;
      }
      invalidate();
    }
  });

  return (
    <group ref={ref} visible={visible}>
      <group ref={innerRef}>
        {visible && coreicon.map((s, i) => (
          <IconBillboard
            key={s.id}
            position={positions[i]}
            iconUrl={s.icon as unknown as string}
            tooltip={s.tooltipText}
            href={s.url}
          />
        ))}
      </group>
    </group>
  );
});
SkillsScene.displayName = 'SkillsScene';
export default SkillsScene;
