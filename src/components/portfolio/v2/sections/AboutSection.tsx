'use client';

import { motion } from 'framer-motion';
import GoldHeading from '../shared/GoldHeading';
import { ImgixImage } from '@/constants/storage';
import Image from 'next/image';
import { MapPin, Download, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOTTO_TEXT = 'PASSIONATE TO MAKE THE REMARKABLE THING';
const FAVORITES = ['Blue', 'Cat', 'Basketball', 'Motorcycle', 'Mobile MOBA'];
const LOCATION = 'Bangkok, Thailand';

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const AboutSection = () => {
  const handleDownloadCV = () => {
    window.open(ImgixImage.cv_pdf2, '_blank');
  };

  return (
    <motion.div
      className="flex flex-col justify-center h-full p-6 md:p-12 bg-transparent overflow-y-auto"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={itemVariants}>
        <GoldHeading as="h2" className="text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8">
          About Me
        </GoldHeading>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-4xl">
        {/* Profile Image with Hover Effect */}
        <motion.div
          variants={itemVariants}
          className="relative group flex-shrink-0 self-start"
        >
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden">
            {/* Base Image */}
            <Image
              src={ImgixImage.profilepic_faceMe}
              alt="Ittipol Vongapai"
              fill
              className="object-cover transition-opacity duration-300 group-hover:opacity-0"
              sizes="160px"
            />
            {/* Hover Image */}
            <Image
              src={ImgixImage.profilepic_faceMeEff}
              alt="Ittipol Vongapai"
              fill
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              sizes="160px"
            />
            {/* Border Glow on Hover */}
            <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400/0 group-hover:border-yellow-400/50 transition-colors duration-300" />
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 space-y-4 md:space-y-5">
          {/* Name and Bio */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Ittipol Vongapai
            </h3>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed font-light">
              A self-driven, introverted software developer with 5 years of experience, I&apos;m based in Thailand and powered by a steady diet of ramen and juice. My current focus areas include ReactJS, generative AI technologies, and frontend development.
            </p>
          </motion.div>

          {/* Favorites */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-yellow-500" />
              <h4 className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                Favorites
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {FAVORITES.map((item, index) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(251, 191, 36, 0.2)' }}
                  className="px-3 py-1 bg-yellow-100/80 text-yellow-800 border border-yellow-200 text-xs md:text-sm rounded-full font-medium shadow-sm backdrop-blur-sm cursor-default transition-colors"
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Location */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 text-gray-500">
            <MapPin className="w-4 h-4 text-yellow-500" />
            <span className="text-sm">{LOCATION}</span>
          </motion.div>

          {/* CV Download Button */}
          <motion.div variants={itemVariants}>
            <Button
              onClick={handleDownloadCV}
              variant="outline"
              className="gap-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 transition-all"
            >
              <Download className="w-4 h-4" />
              Download CV
            </Button>
          </motion.div>

          {/* Motto */}
          <motion.div
            variants={itemVariants}
            className="pt-4 md:pt-6"
          >
            <p className="text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 font-medium">
              &ldquo;{MOTTO_TEXT}&rdquo;
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AboutSection;
