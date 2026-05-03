import { forwardRef } from 'react';
import type { Group } from 'three';
import WordGalaxy from '../primitives/WordGalaxy';

const MainScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => (
  <group ref={ref} visible={visible}>
    <WordGalaxy visible={visible} />
  </group>
));
MainScene.displayName = 'MainScene';
export default MainScene;
