import Image from 'next/image';
import Link from 'next/link';

import { main } from '@/model/mapdata';
import { ImgixImage } from '@/model/storage';

import Typewriter from 'typewriter-effect';

const Main: React.FC = () => {
  return (
    <section
      id="main"
      className="md:container md:max-w-[1140px] p-0 md:px-5 mx-auto grid grid-cols-12 gap-0 md:gap-8 items-center justify-center"
    >
      <nav className="z-10 h-screen col-span-3 md:col-span-2 flex pt-20 pl-1 sm:pl-2 md:p-0 items-start md:items-center justify-start md:justify-center bg-[#000] md:bg-transparent">
        <ul className="flex flex-col-reverse">
          {main.map(({ display, url }, index) => {
            return (
              <div
                key={index}
                className="textglow last:hidden first-letter:text-normal first-letter:textglow2 hover:text-white font-bold text-sm sm:text-2xl lg:text-3xl xl:text-4xl first-letter:text-2xl sm:first-letter:text-4xl lg:first-letter:text-5xl xl:first-letter:text-6xl text-white block uppercase tracking-wider"
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
      </nav>
      <figure className="seembghi rounded-none h-screen w-full flex items-start md:items-end justify-center z-0 p-0 pb-0 col-span-9 md:col-span-5 overflow-hidden bg-head">
        <main className="glass rounded-none h-screen w-full flex items-start md:items-end justify-center z-0 p-0 pb-0 col-span-9 md:col-span-5 overflow-hidden bg-head ">
          <Image
            src={ImgixImage.profilepic_me}
            alt=""
            width={870}
            height={1906}
          />
        </main>
      </figure>
      <figcaption className="z-20 h-1/2 md:h-screen font-semibold text-sm sm:text-2xl lg:text-2xl xl:text-4xl col-span-9 md:col-span-5 bg-head md:bg-transparent flex items-end md:items-center">
        <div
          className="absolute flex flex-col items-start justify-center
       glass2 rounded-3xl w-[70vw] md:w-auto md:left-auto left-[calc(0px+15vw)] bottom-[calc(0px+10vw)] md:m-0 p-4 md:p-10 md:static md:bottom-0"
        >
          <div className="flex flex-col">
            <div className="flex flex-row md:flex-col mb-2">
              <div className="mr-2 md:mr-0 py-1 xl:py-2">Hello!!</div>
              <div className="py-1 xl:py-2">
                My&nbsp;name&nbsp;is&nbsp;
                <span className="text-normalH">ITTIPOL</span>
              </div>
            </div>
            <div className="flex flex-row md:flex-col">
              <div className="py-1 xl:py-2 text-white">I&apos;m&nbsp;</div>
              <div className="py-1 xl:py-2 text-normalH">
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
            </div>
          </div>
          <h1 className="w-full p-6 sm:py-12 md:py-16 flex flex-col items-start justify-center text-normalH uppercase">
            <div>&quot;Passionate to make the remarkable thing&quot;</div>
          </h1>
        </div>
      </figcaption>
    </section>
  );
};

export default Main;
