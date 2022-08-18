import { ImgixImage } from '@/model/storage';
import Image from 'next/image';
import Link from 'next/link';
// import { useRouter } from 'next/router';
import IndexLayout from '@/layouts/layout.Index';
import { NextPageWithLayout } from '../pageWithLayouts';

type Props = {};

const e404: NextPageWithLayout = (props: Props) => {
  // const { locale } = useRouter();

  return (
    <>
      <section className="container mx-auto flex flex-col items-center justify-center h-screen text-2xl md:text-5xl gap-4">
        <Image src={ImgixImage.errorcat_404} alt="" width={750} height={600} />
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
