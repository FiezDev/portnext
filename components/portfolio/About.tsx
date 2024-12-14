import Image from 'next/image';

import Button from '@/components/global/Button';
import Heading from '@/components/global/Heading';
import { ImgixImage } from '@/constants/storage';

const FAVORITES = ['Blue', 'Cat', 'Basketball', 'Motorcycle', 'Mobile MOBA'];
const LOCATION = 'Samutprakarn, Thailand';

const About = () => {
  return (
    <section
      id="about"
      className="container flex flex-col items-center justify-center mx-auto pt-16 md:pt-24 px-5"
    >
      <Heading className="pb-16" text="About Me" />
      <main className="flex flex-col md:flex-row items-center justify-center gap-4">
        <figure className="w-full md:w-1/3 relative group">
          <Image
            src={ImgixImage.profilepic_faceMeEff}
            className="rounded-3xl transition-opacity duration-300"
            width={1000}
            height={1000}
            alt="Profile picture of [Your Name]"
            priority
          />
          <Image
            src={ImgixImage.profilepic_faceMe}
            className="absolute top-0 left-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            width={1000}
            height={1000}
            alt="Profile picture of [Your Name] on hover"
            priority
          />
        </figure>
        <article className="glass p-10 md:p-16 w-full h-full md:w-2/3 grid grid-cols-2 items-start text-left text-base md:text-2xl rounded-3xl gap-10">
          <p className="col-span-2">
            A self-driven, introverted software developer with 3 years of
            experience, I&apos;m based in Thailand and powered by a steady diet
            of ramen and juice. My current focus areas include ReactJS,
            generative AI technologies, and frontend development.
          </p>
          <section className="col-span-2 xs:col-span-1">
            <h3 className="text-normal mb-2">Favorites</h3>
            <ul className="list-disc list-inside">
              {FAVORITES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="col-span-2 xs:col-span-1 text-center md:text-left">
            <h3 className="text-normal mb-2">Location</h3>
            <p>{LOCATION}</p>
            <div className="mt-6">
              <a
                href={ImgixImage.cv_pdf2}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button text="Download CV" />
              </a>
            </div>
          </section>
        </article>
      </main>
    </section>
  );
};

export default About;