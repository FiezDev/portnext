'use client';

import Link from 'next/link';

interface NavItem {
  display: string;
  url: string;
}

interface NavigationProps {
  items: NavItem[];
}

const Navigation = ({ items }: NavigationProps) => {
  return (
    <nav className="z-10 h-screen col-span-3 md:col-span-2 flex pt-20 pl-1 sm:pl-2 md:p-0 items-start md:items-center justify-start md:justify-center bg-[#000] md:bg-transparent">
      <ul className="flex flex-col-reverse">
        {items.map(({ display, url }, index) => {
          return (
            <div
              key={index}
              className="textglow last:hidden first-letter:text-normal first-letter:textglow2 hover:text-white font-bold text-sm sm:text-2xl lg:text-3xl xl:text-4xl first-letter:text-2xl sm:first-letter:text-4xl lg:first-letter:text-5xl xl:first-letter:text-6xl text-white block uppercase tracking-wider"
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
    </nav>
  );
};

export default Navigation;
