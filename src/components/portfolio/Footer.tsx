import Image from "next/image";
import Link from "next/link";
import reactP from "@/public/images/react.svg";
import tailwindP from "@/public/images/tailwindcss.svg";
import viteP from "@/public/images/vite.svg";

const Footer = () => {
  return (
    <footer className="fixed z-50 bottom-0 text-gray-400 w-full bg-head">
      <div className="container flex mx-auto flex-row w-full font-medium justify-between text-white">
        <div className="flex pl-4 items-center text-base md:text-xl uppercase">
          <Link
            className="pr-3 border-r-[1px]"
            href="/"
            target=""
            rel="noopener noreferrer"
          >
            <span>Ittpol Vongapai Portfolio</span>
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
        <div className="pl-4 items-center text-base md:text-xl uppercase">
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
    </footer>
  );
};

export default Footer;
