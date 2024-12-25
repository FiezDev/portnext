import About from '@/components/portfolio/About';
import Contact from '@/components/portfolio/Contact';
import Main from '@/components/portfolio/Main';
import Skills from '@/components/portfolio/Skills';
import Works from '@/components/portfolio/Works';

import Head from 'next/head';
import SuspenseWrapper from './global/SuspenseWrapper';
import Sidenav from './portfolio/Sidenav';

const PortfolioContent = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row flex-1">
        <Sidenav />
        <div className="flex-1 seembg">
          <Head>
            <title>Ittipol Portfolio</title>
            <meta
              name="viewport"
              content="initial-scale=1.0, width=device-width"
            />
          </Head>
          <Main />
          <About />
          <Skills />
          <SuspenseWrapper
            text="Loading Works..."
            errorText="Failed to load Works. Please try again later."
          >
            <Works />
          </SuspenseWrapper>
          <div className="glass">
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioContent;
