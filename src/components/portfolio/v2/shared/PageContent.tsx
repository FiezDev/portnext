import { PageId } from './useComplexTransition';
import MainSection from '../sections/MainSection';
import AboutSection from '../sections/AboutSection';
import SkillsSection from '../sections/SkillsSection';
import ProjectsSection from '../sections/ProjectsSection';
import ContactSection from '../sections/ContactSection';

export const PageContent = ({ page }: { page: PageId }) => {
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
