import { ImgixImage } from '@/model/storage';

import Image from 'next/image';
import React, { useState } from 'react';
import Button from '../global/NButton';

import HeadingFirst from '../global/HeadingFirst';

type Props = {};

export interface IAbout {}

const About: React.FC<IAbout> = (props: Props) => {
  const [src, srcSet] = useState(ImgixImage.profilepic_faceMeEff);

  return (
    <div className="flex md:flex-row flex-col text-gray-400 bg-bg">
      <div className="container py-24 flex items-center mx-auto">
        <div className="md:w-1/2 w-5/6 md:mb-0 mb-10">
          <Image
            src={src}
            onMouseEnter={() => srcSet(ImgixImage.profilepic_faceMe)}
            onMouseLeave={() => srcSet(ImgixImage.profilepic_faceMeEff)}
            width={1000}
            height={1000}
            alt="https://dummyimage.com/1000x1000"
          />
        </div>
        <div className="md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
          <HeadingFirst text={'About Me'} />
          <p className="mb-8 text-xl leading-relaxed">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
            Dignissimos magni est, nostrum quod harum itaque! Modi, aperiam
            accusamus reprehenderit aliquam odio voluptate! Id similique sint
            officia molestiae! Ullam minus, beatae et doloremque dolor expedita
            modi ea optio, facere quidem ratione eius praesentium eos,
            accusantium aperiam sint accusamus excepturi id delectus libero.
            Aliquid dignissimos quod doloremque error eum optio itaque quia
            consequuntur vero magni hic omnis, officiis autem neque unde culpa
            iusto, delectus, odit ab quisquam ut. Doloribus quas aliquid
            repellat consequuntur deserunt vitae distinctio sequi dolore,
            cupiditate, eos quaerat ullam saepe quo sint facere quibusdam!
            Voluptate perferendis eius blanditiis molestiae!
          </p>
          <Button text={'itti'} />
          <Button text={'Port Folio'} />
        </div>
      </div>
    </div>
  );
};

export default About;
