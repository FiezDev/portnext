import { ImgixImage } from '@/constants/storage';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

const MainContent = () => {
  return (
    <div className="absolute top-1/2 left-0 w-full -mt-[calc(100vw)/2] md:static md:mt-0 md:h-auto">
      <Head>
        <title>Fiez WebSite Index</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <section className="container mx-auto h-[calc(100vw)] md:h-screen grid grid-cols-2 grid-rows-2 md:grid-rows-3 gap-4">
        <div className="glass row-span-3 md:row-span-full items-start md:items-end lg:items-start overflow-clip flex justify-center ">
          <Link href="/portfolio">
            <Image
              className="object-cover object-top"
              src={ImgixImage.profilepic_me}
              alt=""
              fill={true}
            />
          </Link>
        </div>
        <Link href="/work">
          <div className="relative w-full h-full glass overflow-clip flex items-center justify-center">
            <Image src={ImgixImage.main_portfolio2} alt="" fill={true} />
          </div>
        </Link>
        <Link href="/blog">
          <div className="relative w-full h-full glass overflow-clip flex items-center justify-center">
            <Image src={ImgixImage.main_blog} alt="" fill={true} />
          </div>
        </Link>
        <Link href="/admin/dashboard">
          <div className="relative w-full h-full glass overflow-clip flex items-center justify-center">
            <Image src={ImgixImage.main_admin} alt="" fill={true} />
          </div>
        </Link>
      </section>
    </div>
  );
};

export default MainContent;
