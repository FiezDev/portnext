import About from '@/components/portfolio/v1/About';
import Contact from '@/components/portfolio/v1/Contact';
import Main from '@/components/portfolio/v1/Main';
import Skills from '@/components/portfolio/v1/Skills';
import Head from 'next/head';
import SuspenseWrapper from './global/SuspenseWrapper';
import Projects from './portfolio/v1/Projects';
import Sidenav from './portfolio/v1/Sidenav';

const PortfolioV1Content = () => {
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
            <Projects />
          </SuspenseWrapper>
          <div className="glass">
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioV1Content;
