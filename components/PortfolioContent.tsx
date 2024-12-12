import About from '@/components/portfolio/About';
import Contact from '@/components/portfolio/Contact';
import Main from '@/components/portfolio/Main';
import Skills from '@/components/portfolio/Skills';
import Works from '@/components/portfolio/Works';

import Head from 'next/head';

const PortfolioContent = () => {
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
      <div className="glass">
        <Contact />
      </div>
    </>
  );
};

export default PortfolioContent;
