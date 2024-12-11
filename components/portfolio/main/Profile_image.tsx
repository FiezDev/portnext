'use client';

import { ImgixImage } from '@/constants/storage';
import Image from 'next/image';

const ProfileImage = () => {
  return (
    <figure className="seembgblur relative rounded-none h-screen w-full flex items-start md:items-end justify-center z-0 p-0 pb-0 col-span-9 md:col-span-5 overflow-hidden bg-head">
      <main className="glass rounded-none h-screen w-full z-0 p-0 col-span-9 md:col-span-5 overflow-hidden bg-head flex flex-col justify-end lg:block">
        <Image
          src={ImgixImage.profilepic_me}
          alt="Profile Picture"
          width={870}
          height={1906}
          className="w-full object-contain object-bottom"
        />
      </main>
    </figure>
  );
};

export default ProfileImage;
