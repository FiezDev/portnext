'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useCallback } from 'react';
import { usePrevNextButtons } from './CareuselArrowButton';
import { DotButton, useDotButton } from './CarouselDotButton';

interface EmblaCarouselProp {
  items: string[];
  options?: EmblaOptionsType;
}

const EmblaCarousel = ({ items, options }: EmblaCarouselProp) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({
      playOnInit: true,
      delay: 2000,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
    }),
  ]);

  const onNavButtonClick = useCallback((emblaApi: EmblaCarouselType) => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    const resetOrStop =
      autoplay.options.stopOnInteraction === false
        ? autoplay.reset
        : autoplay.stop;

    resetOrStop();
  }, []);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(
    emblaApi,
    onNavButtonClick
  );

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi, onNavButtonClick);

  return (
    <section className="grid grid-rows-[1fr-60px] gap-4 w-full xs:w-auto xs:h-full">
      <div
        className={`overflow-hidden col-span-2 w-[300px] h-auto sm:w-[400px]`}
        ref={emblaRef}
      >
        <div className="flex touch-pan-y pinch-zoom">
          {items.map((item, index) => (
            <div
              className="rounded-3xl flex-none w-full pl-4 relative h-[19rem]"
              key={index}
            >
              <Image
                className="rounded-3xl object-contain shadow-inner"
                src={`${process.env.NEXT_PUBLIC_IMGIX_URL}${item}`}
                fill
                alt={`Slide ${index + 1}`}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>
      {items.length > 1 && (
        <div className="flex gap-2 pl-4">
          <Button
            size="icon"
            className="w-4 h-4"
            onClick={onPrevButtonClick}
            disabled={prevBtnDisabled}
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </Button>
          <Button
            size="icon"
            className="w-4 h-4"
            onClick={onNextButtonClick}
            disabled={nextBtnDisabled}
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}

      <div
        className={cn(
          'flex justify-end gap-2 pr-4',
          items.length <= 1 && 'col-span-2'
        )}
      >
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            className={cn(
              'w-3 h-3 rounded-full border-2 bg-white',
              index !== selectedIndex && 'bg-transparent'
            )}
            onClick={() => onDotButtonClick(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default EmblaCarousel;
