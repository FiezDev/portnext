import About from '@/components/portfolio/About';
import Contact from '@/components/portfolio/Contact';
import Main from '@/components/portfolio/Main';
import Skills from '@/components/portfolio/Skills';
import Works from '@/components/portfolio/Works';
import PortfolioLayout from '@/layouts/layout.Portfolio';
// import { useRouter } from 'next/router';
import { NextPageWithLayout } from '../pageWithLayouts';

type Props = {};

const Portfolio: NextPageWithLayout = (props: Props) => {
  // const { locale } = useRouter();

  return (
    <>
      <Main />
      <div id="about"></div>
      <About />
      <div id="works"></div>
      <Works />
      <div id="skills"></div>
      <Skills />
      <div id="contact"></div>
      <Contact />
    </>
  );
};

export default Portfolio;

Portfolio.getLayout = (page) => {
  return <PortfolioLayout>{page}</PortfolioLayout>;
};
