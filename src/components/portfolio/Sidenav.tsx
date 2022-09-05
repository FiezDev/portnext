import { menu } from '@/model/mapdata';
import { useToggle } from '@/services/hooks';
import { faBars, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useWindowSize } from 'react-use';

const Nav: React.FC = () => {
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
          {showSidebar ? (
            <FontAwesomeIcon
              className="flex w-[25px] sm:w-[35px] lg:w-[40px] z-[70] items-center fixed left-3 top-4 sm:left-8 sm:top-7 duration-500"
              onClick={setShowSidebar}
              icon={faClose}
            />
          ) : (
            <FontAwesomeIcon
              className="flex w-[25px] sm:w-[35px] lg:w-[40px] z-[70] items-center fixed left-3 top-4 sm:left-8 sm:top-7 duration-500"
              onClick={setShowSidebar}
              icon={faBars}
            />
          )}
          <nav className="top-0 text-white fixed h-screen z-30 lg:w-[200px] sm:w-[100px] -left-[50px] lg:-left-[200px] sm:-left-[100px]">
            <div
              className={`bg-black z-20 fixed pt-40  h-screen ease-in-out duration-300
        ${!showSidebar ? 'translate-x-0 ' : 'translate-x-full'}`}
            >
              <ul className="flex flex-col-reverse">
                {menu.map(({ id, display, url, picurl }) => {
                  return (
                    <a
                      key={id}
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
                          {width >= 540 ? (
                            <span className="hover:scale-x-100">{display}</span>
                          ) : (
                            <FontAwesomeIcon icon={picurl} />
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
      )}
    </>
  );
};

export default Nav;
