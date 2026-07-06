'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { PageId } from './useComplexTransition';
import MainSection from '../sections/MainSection';

// Main renders immediately (landing view). The other sections split into
// their own chunks — prefetched on idle so navigation stays instant.
const AboutSection = dynamic(() => import('../sections/AboutSection'));
const SkillsSection = dynamic(() => import('../sections/SkillsSection'));
const ProjectsSection = dynamic(() => import('../sections/ProjectsSection'));
const ContactSection = dynamic(() => import('../sections/ContactSection'));

const prefetchSections = () => {
  import('../sections/AboutSection');
  import('../sections/SkillsSection');
  import('../sections/ProjectsSection');
  import('../sections/ContactSection');
};

export const PageContent = ({ page }: { page: PageId }) => {
  useEffect(() => {
    // ponytail: plain timeout beats requestIdleCallback type gymnastics here
    const t = window.setTimeout(prefetchSections, 1500);
    return () => clearTimeout(t);
  }, []);

  switch (page) {
    case 'Main':
      return <MainSection />;
    case 'About':
      return <AboutSection />;
    case 'Skill':
      return <SkillsSection />;
    case 'Projects':
      return <ProjectsSection />;
    case 'Contact':
      return <ContactSection />;
    default:
      return null;
  }
};
