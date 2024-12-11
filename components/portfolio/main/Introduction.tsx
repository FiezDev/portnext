'use client';

import Typewriter from 'typewriter-effect';

const Introduction = () => {
  return (
    <figcaption className="z-20 col-span-9 md:col-span-5 h-1/2 md:h-screen flex items-end md:items-center bg-head md:bg-transparent font-semibold text-sm sm:text-2xl lg:text-2xl xl:text-4xl">
      <div className="absolute flex flex-col items-start justify-center glass2 rounded-3xl w-[70vw] md:w-auto left-[15vw] bottom-[10vw] md:static md:bottom-0 p-4 md:p-10">
        <div className="flex flex-col">
          <div className="flex flex-row md:flex-col mb-2">
            <span className="mr-2 md:mr-0 py-1 xl:py-2">Hello!!</span>
            <span className="py-1 xl:py-2">
              My&nbsp;name&nbsp;is&nbsp;
              <span className="text-normalH">ITTIPOL</span>
            </span>
          </div>
          <div className="flex flex-row md:flex-col">
            <span className="py-1 xl:py-2 text-white">I&apos;m&nbsp;</span>
            <span className="py-1 xl:py-2 text-normalH">
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
            </span>
          </div>
        </div>
        <h1 className="w-full p-6 sm:py-12 md:py-16 text-normalH uppercase">
          <span>&quot;Passionate to make the remarkable thing&quot;</span>
        </h1>
      </div>
    </figcaption>
  );
};

export default Introduction;
