import { ImgixImage } from '@/model/storage';
import IndexLayout from '@/src/components/layout.Index';
import Image from 'next/image';
import Link from 'next/link';
// import { useRouter } from 'next/router';
import { NextPageWithLayout } from '../pageWithLayouts';

type Props = {};

const Index: NextPageWithLayout = (props: Props) => {
  // const { locale } = useRouter();

  return (
    <div className="absolute top-1/2 left-0 w-full -mt-[calc(100vw)/2] md:static md:mt-0 md:h-auto">
      <section className="container mx-auto h-[calc(100vw)] md:h-screen grid grid-cols-2 grid-rows-2 md:grid-rows-3">
        <div className="row-span-1 md:row-span-full left-0 top-0 overflow-clip md:flex md:items-center md:justify-center">
          <Image
            src={ImgixImage.profilepic_me}
            alt=""
            width={574}
            height={910}
          />
        </div>
        <>
          <Link href="/portfolio">
            <div className="opacity-30 hover:opacity-100 overflow-clip">
              <Image
                src={ImgixImage.profilepic_devBg}
                alt=""
                width={1430}
                height={1144}
              />
            </div>
          </Link>
        </>
        <>
          <Link href="/admin">
            <div className="opacity-30  hover:opacity-100 overflow-clip">
              <Image
                src={ImgixImage.profilepic_workBg1}
                alt=""
                width={1024}
                height={1024}
              />
            </div>
          </Link>
        </>
        <>
          <Link href="/blog">
            <div className="opacity-30  hover:opacity-100 overflow-clip">
              <Image
                src={ImgixImage.profilepic_workBg2}
                alt=""
                width={1024}
                height={1024}
              />
            </div>
          </Link>
        </>
      </section>
    </div>
  );
};

export default Index;

Index.getLayout = (page) => {
  return <IndexLayout>{page}</IndexLayout>;
};
