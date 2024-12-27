import { cn } from '@/src/lib/utils';
import { SideProjectObj } from '@/src/types/object';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { Badge } from '../ui/badge';

const SideProject = ({
  projectName,
  projectDesc,
  stack,
  ghlink,
  weblink,
  apilink,
  className,
}: SideProjectObj & { className?: string }) => {
  return (
    <div
      id="mainside"
      className={cn(
        'glass rounded-3xl p-4 h-auto flex flex-col md:flex-row  gap-4 z-10 ',
        className && className
      )}
    >
      <div className="p-5 pb-0 lg:pb-5 w-full lg:w-2/5 z-10">
        <div className="text-normal text-3xl font-[700] antialiased tracking-wide uppercase pb-4">
          Project
        </div>
        <div className="text-white antialiased text-lg font-extrabold pb-4">
          {projectName}
        </div>
        <h1 className="pt-4">
          {stack.map((item, index) => (
            <Badge
              className="m-1 text-sm font-semibold tracking-wider text-white bg-head focus:outline-none hover:bg-blue-600"
              key={index}
              variant="default"
            >
              {item}
            </Badge>
          ))}
        </h1>
      </div>
      <div className="p-5 gap-4 pt-0 lg:pt-5 w-full lg:w-3/5 text-lg z-10 flex flex-col justify-between">
        <ul>
          {projectDesc.map((item, index) => (
            <li
              className="text-wrap break-words overflow-hidden whitespace-normal"
              key={index}
            >
              {item}
            </li>
          ))}
        </ul>
        <ul className="flex gap-4">
          {weblink && (
            <Link href={`//${weblink}`} passHref>
              <FontAwesomeIcon icon={faGlobe} size="xl" color="white" />
            </Link>
          )}
          {ghlink && (
            <Link href={`//${ghlink}`} passHref>
              <FontAwesomeIcon icon={faGithub} size="xl" color="white" />
            </Link>
          )}
          {apilink && (
            <Link href={`//${apilink}`} passHref>
              <span className="text-light">AmadeusFlightAPI</span>
            </Link>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SideProject;
