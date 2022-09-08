import About from '@/components/portfolio/About';
import Contact from '@/components/portfolio/Contact';
import Main from '@/components/portfolio/Main';
import Skills from '@/components/portfolio/Skills';
import Works from '@/components/portfolio/Works';
import PortfolioLayout from '@/layouts/layout.Portfolio';
import Head from 'next/head';
import { NextPageWithLayout } from '../pageWithLayouts';

const Portfolio: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Ittipol Portfolio</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Main />
      <About />
      <Skills />
      <Works />
      <div className="seembghi">
        <div className="glass">
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
