import gsap from 'gsap';
import type { Camera, Vector3 } from 'three';
import type { PageId } from '../shared/pages';

export interface CameraTarget {
  pos: [number, number, number];
  look: [number, number, number];
}

export const CAMERA_PRESETS: Record<PageId, CameraTarget> = {
  Main:     { pos: [0, 0, 6],       look: [0, 0, 0] },
  About:    { pos: [-2, 0.3, 5],    look: [0, 0, 0] },
  Skill:    { pos: [0, 0, 4.5],     look: [0, 0, 0] },
  Projects: { pos: [0, 0.5, 5.5],   look: [0, 0, 0] },
  Contact:  { pos: [0, 0, 6],       look: [0, 0, 0] },
};

export interface SceneAnimator {
  enter: (tl: gsap.core.Timeline, position: string | number) => void;
  leave: (tl: gsap.core.Timeline, position: string | number) => void;
}

interface BuildArgs {
  camera: Camera;
  cameraLook: Vector3;
  fromAnimator?: SceneAnimator;
  toAnimator?: SceneAnimator;
  reducedMotion: boolean;
  fromPage: PageId;
  toPage: PageId;
  onComplete?: () => void;
}

export function buildTransitionTimeline(args: BuildArgs): gsap.core.Timeline {
  const { camera, cameraLook, fromAnimator, toAnimator, reducedMotion, toPage, onComplete } = args;
  const tl = gsap.timeline({ onComplete });
  const dur = reducedMotion ? 0 : 0.9;

  fromAnimator?.leave(tl, 0);

  const target = CAMERA_PRESETS[toPage];
  tl.to(camera.position, {
    x: target.pos[0], y: target.pos[1], z: target.pos[2],
    duration: dur, ease: 'power3.inOut',
  }, 0.25);
  tl.to(cameraLook, {
    x: target.look[0], y: target.look[1], z: target.look[2],
    duration: dur, ease: 'power3.inOut',
  }, 0.25);

  toAnimator?.enter(tl, 0.4);

  return tl;
}
