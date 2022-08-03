import { useContext, useState } from "react";
import Link from "next/link";
// import Head from 'next/head'
import Image from "next/image";
// import useFirebase from "../adapters/firebase";
// import _function from "../adapters/function";
// import { Firestore } from "../contexts/storage";
import Typewriter from "typewriter-effect";
import me from "@/public/images/me.png";
import reactP from "@/public/images/react.svg";
import tailwindP from "@/public/images/tailwindcss.svg";
import viteP from "@/public/images/vite.svg";

const Home = () => {
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

  //   let { randomName } = _function();
  //   let { getStorage, setProject, getProject, getAllProject } = useFirebase();

  // const setData = setProject(project);
  // console.log(setData);
  // const getData = getAllProject();
  // console.log(getData);

  return (
    <main className="lg:container mx-auto grid grid-cols-12 gap-4">
      <section className="z-20 row-span-6 col-span-3 md:col-span-2 h-screen flex pt-10 items-start md:p-0 md:items-center justify-center">
        <ul className="flex flex-col-reverse">
          {main.map(({ display, url }, index) => {
            return (
              <div
                key={index}
                className="last:hidden first-letter:text-normalH hover:text-white ml-4 font-bold text-xl xl:text-3xl xl:first-letter:text-6xl first-letter:text-4xl text-white block uppercase tracking-wider"
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
      <section className="z-0 row-span-6 col-start-4 col-span-9 md:col-span-5 h-screen flex items-center justify-center bg-head">
        <Image src={me} alt="" className="lg:h-[75vh]" />
      </section>
      <section className="z-10 absolute text-2xl lg:text-3xl xl:text-5xl md:static left-0 bottom-0 row-span-6 col-span-5 h-screen flex items-end md:items-center gap-12">
        <div className="glass w-[90vw] m-10 p-10 md:m-0 md:w-auto md:relative md:right-[5vw]  ">
          <div className="flex flex-row md:flex-col">
            <div className="mr-2 md:mr-0 py-1 xl:py-2">Hello!!</div>
            <div className="py-1 xl:py-2">
              My name is&nbsp;<span className="text-normalH">ITTIPOL</span>
            </div>
          </div>
          <div className="py-0 md:py-1 xl:py-2 flex flex-row text-normalH">
            <span className="text-white">I&apos;m&nbsp;</span>
            <Typewriter
              options={{
                strings: ["Fullstack", "Frontend", "Web"],
                autoStart: true,
                loop: true,
              }}
            />

            <span>Developer</span>
          </div>
          <h1 className="py-12 md:py-24 items-center text-normalH">
            &quot;Passionate to make the remarkable thing&quot;
          </h1>
          <div className="flex flex-row md:flex-col justify-between">
            <div className="text-base xl:text-xl uppercase">
              <Link
                className="pr-3 border-r-[1px]"
                href="/"
                target=""
                rel="noopener noreferrer"
              >
                <span>Code Example</span>
              </Link>
              <span className="inline-flex items-center p-3 gap-4">
                <a
                  href="https://github.com/FiezDev"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa fa-github" aria-hidden="true"></i>
                </a>
                <a
                  href="https://codepen.io/fiezdev"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa fa-codepen" aria-hidden="true"></i>
                </a>
              </span>
            </div>
            <div className="text-base xl:text-xl uppercase">
              <span className="pr-3 border-r-[1px]">Site Use</span>
              <span className="inline-flex items-center p-3 gap-4">
                <a
                  className="w-[20px]"
                  href="https://reactjs.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src={reactP} alt="" />
                </a>
                <a
                  className="w-[20px]"
                  href="https://tailwindcss.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src={tailwindP} alt="" />
                </a>
                <a
                  className="w-[20px]"
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
export default Home;
