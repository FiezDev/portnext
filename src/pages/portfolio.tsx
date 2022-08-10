import About from '@/components/portfolio/About';
import Contact from '@/components/portfolio/Contact';
import Skills from '@/components/portfolio/Skills';
import Works from '@/components/portfolio/Works';
import Main from '@/components/portfolio/Main';
import PortfolioLayout from '../components/layoutPortfolio';

type Props = {};

const Portfolio = (props: Props) => {
  return (
    <>
      <Main />
      <About />
      <Works />
      <Skills />
      <Contact />
    </>
  );
};
Portfolio.layout = PortfolioLayout;
export default Portfolio;
