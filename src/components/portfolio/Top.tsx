import Link from 'next/link';
import { useState } from 'react';

import { faCodepen, faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Switch } from '@material-tailwind/react';

const Top = () => {
  const [lang, setLang] = useState();
  return (
    <header className="fixed z-50 top-0 w-full">
      <div className="container flex items-center justify-end mx-auto text-xs sm:text-base xl:text-xl uppercase gap-6 pt-10 px-5">
        <Switch defaultChecked />
        <Switch defaultChecked />
        <Link
          className="w-[13px] sm:w-[20px] md:w-[40px] flex content-center text-white"
          href="https://github.com/FiezDev"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faGithub} className="gap-4" />
        </Link>
        <Link
          className="w-[13px] sm:w-[20px] md:w-[40px] flex content-center text-white"
          href="https://codepen.io/fiezdev"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faCodepen} />
        </Link>
      </div>
    </header>
  );
};

export default Top;
