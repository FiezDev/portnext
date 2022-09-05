import Image from 'next/image';
import Link from 'next/link';

import IndexLayout from '@/layouts/layout.Index';
import { ImgixImage } from '@/model/storage';
import { NextPageWithLayout } from '../pageWithLayouts';

type Props = {};

const Index: NextPageWithLayout = (props: Props) => {
  // const { locale } = useRouter();

  return (
    <div className="absolute top-1/2 left-0 w-full -mt-[calc(100vw)/2] md:static md:mt-0 md:h-auto">
      <section className="container mx-auto h-[calc(100vw)] md:h-screen grid grid-cols-2 grid-rows-2 md:grid-rows-3 gap-5">
        <Link href="/portfolio">
          <div className="row-span-1 md:row-span-full items-start md:items-end lg:items-start overflow-clip flex  justify-center border-2">
            <Image
              src={ImgixImage.profilepic_me}
              alt=""
              width={870}
              height={1906}
            />
          </div>
        </Link>

        <Link href="/work">
          <div className="overflow-clip flex items-center justify-center opacity-30 hover:opacity-100 shadow shadow-white">
            <Image
              src={ImgixImage.main_portfolio2}
              alt=""
              width={480}
              height={360}
            />
          </div>
        </Link>

        <Link href="/blog">
          <div className="overflow-clip flex items-center justify-center opacity-30 hover:opacity-100 shadow shadow-white">
            <Image src={ImgixImage.main_blog} alt="" width={600} height={405} />
          </div>
        </Link>

        <Link href="/admin">
          <div className="overflow-clip flex items-center justify-center opacity-30 hover:opacity-100 shadow shadow-white">
            <Image
              src={ImgixImage.main_admin}
              alt=""
              width={1535}
              height={864}
            />
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
