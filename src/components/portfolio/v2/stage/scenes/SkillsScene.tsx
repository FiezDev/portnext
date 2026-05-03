import type { Group } from 'three';
import { forwardRef } from 'react';

const SkillsScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => (
  <group ref={ref} visible={visible}>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshBasicMaterial color="#10B981" />
    </mesh>
  </group>
));
SkillsScene.displayName = 'SkillsScene';
export default SkillsScene;
