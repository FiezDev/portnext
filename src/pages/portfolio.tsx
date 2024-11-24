import { InferGetStaticPropsType } from 'next';
import Head from 'next/head';

import About from '@/components/portfolio/About';
import Contact from '@/components/portfolio/Contact';
import Main from '@/components/portfolio/Main';
import Skills from '@/components/portfolio/Skills';
import Works from '@/components/portfolio/Works';
import PortfolioLayout from '@/layouts/layout.Portfolio';
import { project } from '@/src/types/object';
import { NextPageWithLayout } from '../pageWithLayouts';

import axios from 'axios';

const Portfolio: NextPageWithLayout<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ project }) => {
  return (
    <>
      <Head>
        <title>Ittipol Portfolio</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {/* <Top /> */}
      <Main />
      <About />
      <Skills />
      <Works
        props={{
          project: project,
        }}
      />
      <div className="glass">
        <Contact />
      </div>
    </>
  );
};

export default Portfolio;

export async function getStaticProps() {
  const colname = 'Projects';
  const res = await axios.get(
    `https://nextbackend-fiezdev.vercel.app/api/fireStoreGetAll?colname=${colname}`
  );

  const data: Array<project> = await res.data;
  return {
    props: {
      project: data,
    },
  };
}

Portfolio.getLayout = (page) => {
  return <PortfolioLayout>{page}</PortfolioLayout>;
};
