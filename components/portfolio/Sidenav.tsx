'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { menu } from '@/constants/mapdata';

import { useToggle } from '@/hooks/useToggle';
import useWindowSize from '@/hooks/useWindowSize';
import { cn } from '@/lib/utils';
import { faBars, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Sidenav = () => {
  const { width, height } = useWindowSize();
  const [showSidebar, setShowSidebar] = useToggle();
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [scrollHeight, setScrollHeight] = useState(0);

  useEffect(() => {
    const listenToScroll = () => {
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop;
      setScrollHeight(winScroll);

      if (scrollHeight > height) {
        setIsNavVisible(true);
      } else {
        setIsNavVisible(false);
      }
    };

    window.addEventListener('scroll', listenToScroll);
    return () => window.removeEventListener('scroll', listenToScroll);
  }, [scrollHeight, height]);

  return (
    <>
      {isNavVisible && (
        <>
          <FontAwesomeIcon
            className="flex w-[25px] h-[25px] sm:w-[35px] sm:h-[35px] z-[70] items-center fixed left-3 top-4 sm:left-8 sm:top-7 duration-500"
            onClick={setShowSidebar}
            icon={showSidebar ? faClose : faBars}
          />
          <nav className="top-0 text-white fixed h-screen z-30 lg:w-[200px] sm:w-[100px] -left-[50px] lg:-left-[200px] sm:-left-[100px]">
            <div
              className={cn(
                'bg-black z-20 fixed pt-40  h-screen ease-in-out duration-300',
                !showSidebar ? 'translate-x-0 ' : 'translate-x-full'
              )}
            >
              <ul className="flex flex-col-reverse">
                {menu.map(({ id, display, url, picurl }) => {
                  return (
                    <div
                      key={id}
                      className="hover:text-white text-center text-white block uppercase tracking-wider glow"
                    >
                      <Link href={url}>
                        <li
                          className={cn(
                            'relative p-[10px] duration-500 text-white',
                            'w-[50px] lg:w-[200px] sm:w-[100px] sm:p-[15px] hover:lg:translate-x-[20px]',
                            'hover:bg-normal hover:scale-x-110 hover:duration-500 hover:md:translate-x-[15px] hover:translate-x-[5px]',
                            'before:absolute before:top-0 before:left-[-10px] before:w-[10px] before:h-full',
                            'before:bg-head before:brightness-75 before:origin-right',
                            'before:hover:bg-normal before:hover:brightness-75'
                          )}
                        >
                          {width >= 650 ? (
                            <div className="hover:scale-x-100">{display}</div>
                          ) : (
                            <FontAwesomeIcon icon={picurl} />
                          )}
                        </li>
                      </Link>
                    </div>
                  );
                })}
              </ul>
            </div>
          </nav>
        </>
      )}
    </>
  );
};

export default Sidenav;
