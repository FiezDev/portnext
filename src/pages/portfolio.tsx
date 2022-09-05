import About from '@/components/portfolio/About';
import Contact from '@/components/portfolio/Contact';
import Main from '@/components/portfolio/Main';
import Skills from '@/components/portfolio/Skills';
import Works from '@/components/portfolio/Works';
import PortfolioLayout from '@/layouts/layout.Portfolio';
import { NextPageWithLayout } from '../pageWithLayouts';

const Portfolio: NextPageWithLayout = () => {
  return (
    <>
      <div id="main">
        <Main />
      </div>
      <div id="about">
        <About />
      </div>
      <div id="skills">
        <Skills />
      </div>
      <div id="works">
        <Works />
      </div>
      <div className="seembghi" id="contact">
        <div className="glass2">
          <Contact />
        </div>
      </div>
    </>
  );
};

export default Portfolio;

Portfolio.getLayout = (page) => {
  return <PortfolioLayout>{page}</PortfolioLayout>;
};
