import { ImgixImage } from '@/model/storage';
import Image from 'next/image';
import Link from 'next/link';

import IndexLayout from '@/layouts/layout.Index';
import Head from 'next/head';
import { NextPageWithLayout } from '../pageWithLayouts';

type Props = {};

const e404: NextPageWithLayout = (props: Props) => {
  // const { locale } = useRouter();

  return (
    <>
      <Head>
        <title>Path not found</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <section className="container mx-auto flex flex-col items-center justify-center h-screen text-2xl md:text-5xl gap-4">
        <Image src={ImgixImage.error_404} alt="" width={750} height={600} />
        <span>Someone is Lost</span>
        <span className="text-head">
          <Link href="/">Go Back</Link>
        </span>
      </section>
    </>
  );
};

export default e404;

e404.getLayout = (page) => {
  return <IndexLayout>{page}</IndexLayout>;
};
