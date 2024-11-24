import { ImgixImage } from '@/src/constants/storage';
import Image from 'next/image';

import AdminLayout from '@/src/layouts/layout.Admin';
import { NextPageWithLayout } from '@/src/pageWithLayouts';
import Head from 'next/head';

type Props = {};

const contact: NextPageWithLayout = (props: Props) => {
  // const { locale } = useRouter();

  return (
    <>
      <Head>
        <title>Contact ManageMent</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <section className="flex flex-col items-center justify-center h-screen text-2xl md:text-5xl gap-4 bg-light">
        <Image src={ImgixImage.error_404} alt="" width={750} height={600} />
        <span className="text-black">Contact Page</span>
      </section>
    </>
  );
};

export default contact;

contact.getLayout = (page) => {
  return <AdminLayout>{page}</AdminLayout>;
};
