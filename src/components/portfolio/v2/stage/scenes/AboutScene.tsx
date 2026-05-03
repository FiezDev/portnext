import type { Group } from 'three';
import { forwardRef } from 'react';

const AboutScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => (
  <group ref={ref} visible={visible}>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshBasicMaterial color="#3B82F6" />
    </mesh>
  </group>
));
AboutScene.displayName = 'AboutScene';
export default AboutScene;
