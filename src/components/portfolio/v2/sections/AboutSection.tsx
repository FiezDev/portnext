'use client';

import { useRef } from 'react';
import GoldHeading from '../shared/GoldHeading';
import { ImgixImage } from '@/constants/storage';
import { MapPin, Download, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollyEntrance } from '../gsap/useScrollyEntrance';

const MOTTO_TEXT = 'PASSIONATE TO MAKE THE REMARKABLE THING';
const FAVORITES = ['Blue', 'Cat', 'Basketball', 'Motorcycle', 'Mobile MOBA'];
const LOCATION = 'Bangkok, Thailand';

const AboutSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  useScrollyEntrance(ref);

  const handleDownloadCV = () => window.open(ImgixImage.cv_pdf2 as unknown as string, '_blank');

  return (
    <div ref={ref} className="flex flex-col justify-center h-full p-6 md:p-12 bg-transparent overflow-y-auto pointer-events-none">
      <div data-stagger>
        <GoldHeading as="h2" className="text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8">About Me</GoldHeading>
      </div>
      <div className="flex-1 max-w-2xl space-y-4 md:space-y-5">
        <div data-stagger>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Ittipol Vongapai</h3>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed font-light">
            A self-driven, introverted software developer with 5 years of experience, I&apos;m based in Thailand and powered by a steady diet of ramen and juice. My current focus areas include ReactJS, generative AI technologies, and frontend development.
          </p>
        </div>
        <div data-stagger>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-yellow-500" />
            <h4 className="text-xs uppercase tracking-widest text-gray-400 font-bold">Favorites</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {FAVORITES.map((item) => (
              <span key={item} className="px-3 py-1 bg-yellow-100/80 text-yellow-800 border border-yellow-200 text-xs md:text-sm rounded-full font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div data-stagger className="flex items-center gap-2 text-gray-500">
          <MapPin className="w-4 h-4 text-yellow-500" />
          <span className="text-sm">{LOCATION}</span>
        </div>
        <div data-stagger className="pointer-events-auto">
          <Button onClick={handleDownloadCV} variant="outline" className="gap-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 transition-all">
            <Download className="w-4 h-4" /> Download CV
          </Button>
        </div>
        <div data-stagger className="pt-4 md:pt-6">
          <p className="text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 font-medium">
            &ldquo;{MOTTO_TEXT}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
