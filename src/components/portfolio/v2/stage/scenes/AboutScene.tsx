'use client';

import { forwardRef } from 'react';
import type { Group } from 'three';
import PortraitCard3D from '../primitives/PortraitCard3D';
import { ImgixImage } from '@/constants/storage';

const AboutScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => (
  <group ref={ref} visible={visible}>
    <PortraitCard3D
      baseUrl={ImgixImage.profilepic_faceMe as unknown as string}
      hoverUrl={ImgixImage.profilepic_faceMeEff as unknown as string}
      position={[1.2, 0, 0]}
    />
  </group>
));
AboutScene.displayName = 'AboutScene';
export default AboutScene;
