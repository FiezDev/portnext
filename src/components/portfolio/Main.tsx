import { ImgixImage } from '@/model/storage';
import Image from 'next/image';
import Link from 'next/link';
import Typewriter from 'typewriter-effect';

const main = () => {
  const main = [
    {
      display: 'Contact',
      url: '#contact',
    },
    {
      display: 'Work',
      url: '#works',
    },
    {
      display: 'Skill',
      url: '#skills',
    },
    {
      display: 'About',
      url: '#about',
    },
    {
      display: 'Home',
      url: '#main',
    },
  ];
  return (
    <main className="md:container mx-auto grid grid-cols-12 gap-0 md:gap-12">
      <Image
        className="opacity-20"
        layout="fill"
        alt=""
        src={ImgixImage.bg4k}
      />
      <section className="z-10 h-screen col-span-3 md:col-span-2 flex pt-20 pl-1 sm:pl-2 md:p-0 items-start md:items-center justify-start md:justify-center bg-[#000] md:bg-transparent">
        <ul className="flex flex-col-reverse">
          {main.map(({ display, url }, index) => {
            return (
              <div
                key={index}
                className="last:hidden first-letter:text-normalH hover:text-white font-bold text-sm sm:text-2xl lg:text-3xl xl:text-4xl first-letter:text-2xl sm:first-letter:text-4xl lg:first-letter:text-5xl xl:first-letter:text-6xl  text-white block uppercase tracking-wider"
              >
                <Link href={url}>
                  <li
                    className="relative p-[10px] duration-500
              hover:scale-x-110 hover:duration-500
             sm:p-[15px] hover:lg:translate-x-[40px] hover:md:translate-x-[30px] hover:translate-x-[10px]
                "
                  >
                    <span className="hover:scale-x-100">{display}</span>
                  </li>
                </Link>
              </div>
            );
          })}
        </ul>
      </section>
      <section className="h-screen min-w-[250px] ssm:min-w-full flex items-center z-0 p-10 pb-0 col-span-9 md:col-span-5 overflow-hidden bg-head">
        <Image
          src={ImgixImage.profilepic_me}
          alt=""
          width={870}
          height={1906}
        />
      </section>
      <section className="z-20 h-1/2 md:h-screen font-semibold text-sm sm:text-2xl lg:text-2xl xl:text-4xl col-span-9 md:col-span-5 bg-head md:bg-transparent flex items-end md:items-center">
        <div
          className="absolute flex flex-col items-start justify-center
       glass w-[70vw] md:w-auto md:left-auto left-[calc(0px+15vw)] bottom-[calc(0px+10vw)] md:m-0 p-4 md:p-10 md:static md:bottom-0"
        >
          <div className="flex flex-row md:flex-col">
            <div className="mr-2 md:mr-0 py-1 xl:py-2">Hello!!</div>
            <div className="py-1 xl:py-2">
              My&nbsp;name&nbsp;is&nbsp;
              <span className="text-normalH">ITTIPOL</span>
            </div>
          </div>
          <div className="py-0 md:py-1 xl:py-2 flex flex-row text-normalH">
            <span className="text-white">I&apos;m&nbsp;</span>
            <Typewriter
              options={{
                strings: [
                  'Fullstack Developer',
                  'Frontend Developer',
                  'Web Developer',
                ],
                autoStart: true,
                loop: true,
              }}
            />
          </div>
          <h1 className="w-full p-6 sm:py-12 md:py-16 flex flex-col items-center justify-center text-normalH uppercase">
            <div>&quot;Passionate to make</div>
            <div>the remarkable thing&quot;</div>
          </h1>
        </div>
      </section>
    </main>
  );
};

export default main;
