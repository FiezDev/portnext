'use client';

import { useRef } from 'react';
import type { Group } from 'three';
import type { PageId } from '../shared/pages';
import MainScene from './scenes/MainScene';
import AboutScene from './scenes/AboutScene';
import SkillsScene from './scenes/SkillsScene';
import ProjectsScene from './scenes/ProjectsScene';
import ContactScene from './scenes/ContactScene';
import CameraRig from './CameraRig';
import { SceneBoundary } from './SceneBoundary';

interface SceneControllerProps {
  currentPage: PageId;
  previousPage?: PageId;
}

const SceneController = ({ currentPage, previousPage }: SceneControllerProps) => {
  const mainRef = useRef<Group>(null);
  const aboutRef = useRef<Group>(null);
  const skillsRef = useRef<Group>(null);
  const projectsRef = useRef<Group>(null);
  const contactRef = useRef<Group>(null);

  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 5, 5]} intensity={0.8} />
      <CameraRig currentPage={currentPage} previousPage={previousPage} reducedMotion={reducedMotion} />
      <SceneBoundary name="Main"><MainScene ref={mainRef} visible={currentPage === 'Main'} /></SceneBoundary>
      <SceneBoundary name="About"><AboutScene ref={aboutRef} visible={currentPage === 'About'} /></SceneBoundary>
      <SceneBoundary name="Skill"><SkillsScene ref={skillsRef} visible={currentPage === 'Skill'} /></SceneBoundary>
      <SceneBoundary name="Projects"><ProjectsScene ref={projectsRef} visible={currentPage === 'Projects'} /></SceneBoundary>
      <SceneBoundary name="Contact"><ContactScene ref={contactRef} visible={currentPage === 'Contact'} /></SceneBoundary>
    </>
  );
};

export default SceneController;
