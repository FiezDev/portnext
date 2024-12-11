import { PortfolioHero } from '@/components/portfolio/hero';
import { PortfolioProjects } from '@/components/portfolio/projects';
import { PortfolioSkills } from '@/components/portfolio/skills';
import { PortfolioContact } from '@/components/portfolio/contact';

export default function Home() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      <PortfolioHero />
      <PortfolioProjects />
      <PortfolioSkills />
      <PortfolioContact />
    </div>
  );
}