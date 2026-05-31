import Heading from '@/components/global/Heading';
import { codeUse, infoUse } from '@/constants/mapdata';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Info = () => (
  <div className="p-10 rounded-3xl basis-full xl:basis-2/3 text-center w-full">
    <Heading className="pb-5" text="Contact" />
    <p className="text-left tracking-wide">
      If you&apos;re interested in hiring me, working on a short-term project,
      collaborating, or sharing your thoughts on my work, please feel free to
      contact me. I&apos;ll respond as soon as possible.
    </p>
    <div className="flex flex-col md:flex-row h-full text-base md:text-xl uppercase text-left mt-5">
      <div className="basis-full xl:basis-1/2 text-left pt-10">
        <ul className="flex flex-col gap-3">
          <li className="flex flex-row gap-4 items-center">
            <span>Email</span>
            <span>:</span>
            <div className="flex flex-col gap-3 lowercase">
              <a href="mailto: itti.task@gmail.com">itti.task@gmail.com</a>
            </div>
          </li>
          <li className="flex flex-row gap-4 items-center">
            <span className="text-transparent">Email</span>
            <span className="text-transparent">:</span>
            <div className="flex flex-col gap-3 lowercase">
              <a href="mailto: fiez.dev@gmail.com">fiez.dev@gmail.com</a>
            </div>
          </li>
          {codeUse.map(({ id, url, icon, text }) => (
            <li className="flex flex-row gap-4" key={id}>
              <span>{text}</span>
              <span>:</span>
              <a
                className="w-[20px]"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={icon} className="gap-4 w-[20px]" />
              </a>
            </li>
          ))}
          <li>FiezDev Portfolio @ 2022 - 2024</li>
        </ul>
      </div>
      <div className="basis-full xl:basis-1/2 pt-10">
        <ul className="flex flex-col pl-5 normal-case gap-3">
          {infoUse.map(({ id, icon, text, url }) => (
            <li className="flex flex-row gap-4 items-center" key={id}>
              <FontAwesomeIcon icon={icon} className="w-[20px]" />
              <span>:</span>
              <a href={url}>{text}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default Info;
