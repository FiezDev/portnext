import type { Group } from 'three';
import { forwardRef } from 'react';

const ProjectsScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => (
  <group ref={ref} visible={visible}>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshBasicMaterial color="#F472B6" />
    </mesh>
  </group>
));
ProjectsScene.displayName = 'ProjectsScene';
export default ProjectsScene;
