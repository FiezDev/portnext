import React from "react";
import Link from "next/link";
import Image from "next/image";
import Typewriter from "typewriter-effect";
import reactP from "@/public/images/react.svg";
import tailwindP from "@/public/images/tailwindcss.svg";
import viteP from "@/public/images/vite.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodepen, faGithub } from "@fortawesome/free-brands-svg-icons";

type Props = {};

const main = (props: Props) => {
  const main = [
    {
      display: "Contact",
      url: "/contact",
    },
    {
      display: "Work",
      url: "/works",
    },
    {
      display: "Skill",
      url: "/skills",
    },
    {
      display: "About",
      url: "/about",
    },
    {
      display: "Home",
      url: "/",
    },
  ];
  return (
    <main className="md:container mx-auto grid grid-cols-12 gap-4">
      <section className="z-10 h-screen col-span-3 md:col-span-2 flex pt-20 md:p-0 items-start md:items-center justify-center bg-[#000] md:bg-transparent">
        <ul className="flex flex-col-reverse">
          {main.map(({ display, url }, index) => {
            return (
              <div
                key={index}
                className="last:hidden first-letter:text-normalH hover:text-white ml-4 font-bold text-sm sm:text-2xl lg:text-3xl xl:text-4xl first-letter:text-2xl sm:first-letter:text-4xl lg:first-letter:text-5xl xl:first-letter:text-6xl  text-white block uppercase tracking-wider"
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
      <section className="h-screen flex items-center justify-center z-0 p-10 col-span-9 md:col-span-5 bg-head">
        <Image
          src="https://fiez.imgix.net/me.png"
          alt=""
          width={574}
          height={910}
        />
      </section>
      <section className="z-20 h-auto md:h-screen text-sm sm:text-2xl lg:text-3xl xl:text-5xl col-span-9 md:col-span-5 bg-head md:bg-transparent flex items-end md:items-center">
        <div
          className="absolute flex flex-col items-start justify-center
       glass w-[80vw] md:w-auto md:left-auto left-[calc(0px+10vw)] bottom-[calc(0px+5vw)] md:m-0 p-4 sm:p-10 md:relative md:bottom-0 md:right-[6vw]"
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
                  "Fullstack Developer",
                  "Frontend Developer",
                  "Web Developer",
                ],
                autoStart: true,
                loop: true,
              }}
            />
          </div>
          <h1 className="p-6 sm:py-12 md:py-24 items-center text-normalH">
            &quot;Passionate to make the remarkable thing&quot;
          </h1>
          <div className="flex flex-col justify-between gap-0 sm:gap-1 md:gap-2 lg:gap-3 xl:gap-4">
            <div className="text-xs sm:text-base xl:text-xl uppercase">
              <Link href="/" target="" rel="noopener noreferrer">
                <span className="pr-3 border-r-[1px] ">Code Example</span>
              </Link>
              <span className="inline-flex items-center px-3 gap-4">
                <a
                  className="w-[13px] sm:w-[20px] flex justify-center items-center text-white"
                  href="https://github.com/FiezDev"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faGithub} />
                </a>
                <a
                  className="w-[13px] sm:w-[20px] flex justify-center items-center text-white"
                  href="https://codepen.io/fiezdev"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faCodepen} />
                </a>
              </span>
            </div>
            <div className="text-xs sm:text-base xl:text-xl uppercase">
              <span className="pr-3 border-r-[1px]">Site Use</span>
              <span className="inline-flex items-center justify-center p-3 gap-4">
                <a
                  className="w-[13px] sm:w-[20px] flex justify-center items-center text-white"
                  href="https://reactjs.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src={reactP} alt="" />
                </a>
                <a
                  className="w-[13px] sm:w-[20px] flex justify-center items-center"
                  href="https://tailwindcss.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src={tailwindP} alt="" />
                </a>
                <a
                  className="w-[13px] sm:w-[20px] flex justify-center items-center"
                  href="https://vitejs.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src={viteP} alt="" />
                </a>
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default main;
