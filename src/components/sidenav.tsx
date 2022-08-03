import React, { useContext, useState } from "react";
import Link from "next/link";
// import Head from 'next/head'
import Image from "next/image";
import { Size } from "@/model/hooksModel";
import { useWindowSize,useToggle } from "@/function/hooks";
import menu from "@/context/menu.json";
import ham from "@/public/images/ham.svg";
import close from "@/public/images/close.svg";
import "@/styles/global.css";

const Nav = () => {
  let size : Size = useWindowSize();
  const [showSidebar, setShowSidebar] = useToggle();

  return (
    <>
      {showSidebar ? (
        <Image
          className="flex w-[25px] sm:w-[35px] lg:w-[40px] z-[70] items-center fixed left-3 top-4 sm:left-8 sm:top-7 duration-500"
          onClick={setShowSidebar}
          src={close}
          alt=""
        />
      ) : (
        <Image
          className="flex w-[25px] sm:w-[35px] lg:w-[40px] z-[70] items-center fixed left-3 top-4 sm:left-8 sm:top-7 duration-500"
          onClick={setShowSidebar}
          src={ham}
          alt=""
        />
      )}
      <nav className="glass top-0 text-white fixed h-screen z-30 lg:w-[200px] sm:w-[100px] -left-[50px] lg:-left-[200px] sm:-left-[100px] ">
        <div
          className={`glass z-20 fixed pt-40  h-screen ease-in-out duration-300
        ${!showSidebar ? "translate-x-0 " : "translate-x-full"}`}
        >
          <ul className="flex flex-col-reverse">
            {menu.map(({ display, url, picurl }, index) => {
              return (
                <a
                  key={index}
                  className="hover:text-white text-center text-white block uppercase tracking-wider glow"
                >
                  <Link href={url}>
                    <li
                      className="relative p-[10px] duration-500 
                  hover:bg-normal   hover:scale-x-110 hover:duration-500 
                  w-[50px] lg:w-[200px] sm:w-[100px] sm:p-[15px] hover:lg:translate-x-[20px] hover:md:translate-x-[15px] hover:translate-x-[5px]
                  before:absolute before:top-0 before:left-[-10px] before:w-[10px] before:h-full before:bg-head before:brightness-75 before:origin-right
                  before:hover:bg-normal before:hover:brightness-75
                   "
                    >
                      {size.width >= 640 ? (
                        <span className="hover:scale-x-100">{display}</span>
                      ) : (
                        <i
                          className={`hover:scale-x-100 align-middle ${picurl}`}
                        />
                      )}
                    </li>
                  </Link>
                </a>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Nav;
