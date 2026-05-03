import type { Group } from 'three';
import { forwardRef } from 'react';

const MainScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => (
  <group ref={ref} visible={visible}>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshBasicMaterial color="#FBBF24" />
    </mesh>
  </group>
));
MainScene.displayName = 'MainScene';
export default MainScene;
