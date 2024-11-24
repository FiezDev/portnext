import IndexLayout from '@/layouts/layout.Index';
import { ImgixImage } from '@/src/constants/storage';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { NextPageWithLayout } from '../pageWithLayouts';

type Props = {};

const Index: NextPageWithLayout = (props: Props) => {
  return (
    <div className="absolute top-1/2 left-0 w-full -mt-[calc(100vw)/2] md:static md:mt-0 md:h-auto">
      <Head>
        <title>Fiez WebSite Index</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <section className="container mx-auto h-[calc(100vw)] md:h-screen grid grid-cols-2 grid-rows-2 md:grid-rows-3 gap-5">
        <Link href="/portfolio">
          <div className="glass row-span-1 md:row-span-full items-start md:items-end lg:items-start overflow-clip flex justify-center ">
            <Image
              src={ImgixImage.profilepic_me}
              alt=""
              width={870}
              height={1906}
            />
          </div>
        </Link>

        <Link href="/work">
          <div className="relative w-full h-full glass overflow-clip flex items-center justify-center">
            <Image src={ImgixImage.main_portfolio2} layout="fill" alt="" />
          </div>
        </Link>

        <Link href="/blog">
          <div className="relative w-full h-full glass overflow-clip flex items-center justify-center">
            <Image src={ImgixImage.main_blog} layout="fill" alt="" />
          </div>
        </Link>

        <Link href="/admin/dashboard">
          <div className="relative w-full h-full glass overflow-clip flex items-center justify-center">
            <Image src={ImgixImage.main_admin} layout="fill" alt="" />
          </div>
        </Link>
      </section>
    </div>
  );
};

export default Index;

Index.getLayout = (page) => {
  return <IndexLayout>{page}</IndexLayout>;
};
