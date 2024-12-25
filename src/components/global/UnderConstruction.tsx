import { ImgixImage } from '@/constants/storage';
import Image from 'next/image';
import Link from 'next/link';

const def: WUCProps = {
  linktext: 'Go Back',
  backlink: '/',
};

interface WUCProps {
  linktext: string;
  backlink: string;
}

const UnderConstruction = ({ linktext, backlink }: WUCProps) => {
  const linktextProp = linktext ? linktext : def.linktext;
  const backlinkProp = backlink ? backlink : def.backlink;
  return (
    <>
      <section className="container mx-auto flex flex-col items-center justify-center h-screen w-[800px] text-2xl md:text-5xl gap-8">
        <Image src={ImgixImage.error_wuc} alt="" width={2000} height={1781} />
        <span className="text-head">
          <Link href={backlinkProp}>{linktextProp}</Link>
        </span>
      </section>
    </>
  );
};

export default UnderConstruction;
