import About from '@/components/portfolio/About';
import Contact from '@/components/portfolio/Contact';
import Main from '@/components/portfolio/Main';
import Skills from '@/components/portfolio/Skills';
import Works from '@/components/portfolio/Works';
import PortfolioLayout from '@/src/components/layout.Portfolio';
// import { useRouter } from 'next/router';
import { NextPageWithLayout } from '../pageWithLayouts';

type Props = {};

const Portfolio: NextPageWithLayout = (props: Props) => {
  // const { locale } = useRouter();

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

export default Portfolio;

Portfolio.getLayout = (page) => {
  return <PortfolioLayout>{page}</PortfolioLayout>;
};
