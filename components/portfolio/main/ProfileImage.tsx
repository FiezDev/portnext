import { ImgixImage } from '@/constants/storage';
import Image from 'next/image';

const ProfileImage = () => {
  return (
    <figure className="group seembgblur relative rounded-none h-screen w-full flex items-start md:items-end justify-center z-0 p-0 pb-0 col-span-9 md:col-span-6 overflow-hidden bg-head">
      <main className="relative glass rounded-none h-screen w-full z-0 p-0 col-span-9 md:col-span-4 overflow-hidden bg-head flex flex-col justify-end lg:block">
        <Image
          src={ImgixImage.profilepic_NewMeEff}
          className="absolute inset-0 w-full h-full object-contain object-bottom lg:object-contain lg:object-bottom translate-y-10 transition-opacity duration-300 opacity-100 group-hover:opacity-0"
          fill={true}
          alt="Profile Picture Effect"
          priority
        />
        <Image
          src={ImgixImage.profilepic_NewMe}
          className="absolute inset-0 w-full h-full object-contain object-bottom lg:object-contain lg:object-bottom translate-y-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          fill={true}
          alt="Profile Picture"
          priority
        />
      </main>
    </figure>
  );
};

export default ProfileImage;
