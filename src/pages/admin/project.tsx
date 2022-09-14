import { ImgixImage } from '@/model/storage';
import Image from 'next/image';

import AdminLayout from '@/src/layouts/layout.Admin';
import { NextPageWithLayout } from '@/src/pageWithLayouts';
import Head from 'next/head';

type Props = {};

const project: NextPageWithLayout = (props: Props) => {
  return (
    <>
      <Head>
        <title>Project ManageMent</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <section className="flex flex-col items-center justify-center h-screen text-2xl md:text-5xl gap-4 bg-light">
        <Image src={ImgixImage.error_404} alt="" width={750} height={600} />
        <span className="text-black">Project Page</span>
      </section>
    </>
  );
};

export default project;

project.getLayout = (page) => {
  return <AdminLayout>{page}</AdminLayout>;
};
