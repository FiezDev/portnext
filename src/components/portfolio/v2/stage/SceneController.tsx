'use client';

import { useRef } from 'react';
import type { Group } from 'three';
import type { PageId } from '../shared/useComplexTransition';
import MainScene from './scenes/MainScene';
import AboutScene from './scenes/AboutScene';
import SkillsScene from './scenes/SkillsScene';
import ProjectsScene from './scenes/ProjectsScene';
import ContactScene from './scenes/ContactScene';
import CameraRig from './CameraRig';

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

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 5, 5]} intensity={0.8} />
      <CameraRig currentPage={currentPage} previousPage={previousPage} />
      <MainScene ref={mainRef} visible={currentPage === 'Main'} />
      <AboutScene ref={aboutRef} visible={currentPage === 'About'} />
      <SkillsScene ref={skillsRef} visible={currentPage === 'Skill'} />
      <ProjectsScene ref={projectsRef} visible={currentPage === 'Projects'} />
      <ContactScene ref={contactRef} visible={currentPage === 'Contact'} />
    </>
  );
};

export default SceneController;
