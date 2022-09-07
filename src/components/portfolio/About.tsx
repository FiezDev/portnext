import Image from 'next/image';
import React, { useState } from 'react';

import { ImgixImage } from '@/model/storage';
import Button from '../global/Button';
import Heading from '../global/Heading';

const About: React.FC = () => {
  const [src, srcSet] = useState(ImgixImage.profilepic_faceMeEff);

  return (
    <section className="container flex flex-col items-center justify-center mx-auto pt-16 md:pt-36 px-5">
      <Heading className={'pb-16'} text={'About Me'} />
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="w-full md:w-1/3">
          <Image
            src={src}
            className="rounded-3xl"
            onMouseEnter={() => srcSet(ImgixImage.profilepic_faceMe)}
            onMouseLeave={() => srcSet(ImgixImage.profilepic_faceMeEff)}
            width={1000}
            height={1000}
            alt=""
          />
        </div>
        <div className="glass p-10 md:p-16 w-full h-full md:w-2/3 grid grid-cols-2 items-start text-left text-base md:text-2xl rounded-3xl gap-10">
          <p className="col-span-2">
            Self taught developer based in thailand. with 1+ year of experience.
            Currently interested in reactJS,AI Generated Art and Frontend.
          </p>
          <p className="col-span-2 xs:col-span-1">
            <span className="text-normal">Favourite</span>
            <br />- Blue
            <br />- Cat
            <br />- Basketball
            <br />- Motorcycle
            <br />- Mobile Moba
          </p>

          <p className="col-span-2 xs:col-span-1 text-center md:text-left">
            <span className="text-normal">Live</span> : Samutprakarn, Thailand.
            <br />
            <br />
            <br />
            <a
              href={'https://fiez.imgix.net/cv/ITTI_Resume.pdf'}
              target="blank"
            >
              <Button text={'Resume'} />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
