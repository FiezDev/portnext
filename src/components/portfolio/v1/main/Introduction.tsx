import { cn } from '@/lib/utils';
import GlitchText from './GlitchText';

const Introduction = () => {
  return (
    <figcaption className="z-20 col-span-9 md:col-span-4 h-1/2 md:h-screen flex items-end md:items-center bg-head md:bg-transparent font-semibold text-sm sm:text-2xl lg:text-2xl xl:text-4xl">
      <div
        className={cn(
          'absolute flex flex-col items-start justify-center rounded-3xl w-[70vw] md:w-auto left-[15vw] bottom-[10vw] md:static md:bottom-0 p-4 md:p-10',
          'glass2 md:shadow-none md:bg-none md:backdrop-blur-none md:bg-transparent'
        )}
      >
        <div className="flex flex-col">
          <div className="flex flex-row md:flex-col mb-2">
            <span className="mr-2 md:mr-0 py-1 xl:py-2">Hello!!</span>
          </div>
          <div className="flex flex-row md:flex-col items-center md:items-start">
            <span className="py-1 xl:py-2 mr-2 md:mb-2 md:mr-0 text-white">
              I&apos;m&nbsp;
            </span>
            <GlitchText
              className="text-sm sm:text-2xl lg:text-2xl xl:text-4xl"
              texts={[
                'Fullstack Developer',
                'Frontend Developer',
                'Web Developer',
              ]}
            />
          </div>
        </div>
        <h1 className="w-full p-6 sm:py-12 md:py-16 md:px-0 text-normalH uppercase">
          <span>&quot;Passionate to make the remarkable thing&quot;</span>
        </h1>
      </div>
    </figcaption>
  );
};

export default Introduction;
