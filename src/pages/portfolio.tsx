import About from '@/components/portfolio/About';
import Contact from '@/components/portfolio/Contact';
import Main from '@/components/portfolio/Main';
import Skills from '@/components/portfolio/Skills';
import Works from '@/components/portfolio/Works';
import PortfolioLayout from '@/layouts/layout.Portfolio';
import { useEffect } from 'react';
// import { useRouter } from 'next/router';
import { NextPageWithLayout } from '../pageWithLayouts';
import fireStoreGetAll from './api/fireStoreGetAll';

type Props = {};

const Portfolio: NextPageWithLayout = (props: Props) => {
  useEffect(() => {
    // const setData = setProject(project);
    // console.log(setData);
    const getData = fireStoreGetAll('Projects');
    console.log(getData);

    return () => {};
  }, []);

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
      <div id="contact">
        <Contact />
      </div>
    </>
  );
};

export default Portfolio;

Portfolio.getLayout = (page) => {
  return <PortfolioLayout>{page}</PortfolioLayout>;
};
