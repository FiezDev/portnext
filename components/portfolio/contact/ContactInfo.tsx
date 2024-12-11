'use client';

import { codeUse, infoUse, siteUse } from '@/constants/mapdata';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import React from 'react';
import Heading from '../../global/Heading';

const ContactInfo: React.FC = () => (
  <div className="p-10 rounded-3xl basis-full xl:basis-2/3 text-center w-full">
    <Heading className="pb-5" text="Contact" />
    <p className="text-left tracking-wide">
      If you&apos;re interested in hiring me for a job or a short-term project,
      looking for a collaboration, or simply want to share your thoughts on my
      work, feel free to reach out. I&apos;ll get back to you as promptly as I
      can.
    </p>
    <div className="flex flex-col md:flex-row h-full text-base md:text-xl uppercase text-left mt-5">
      <div className="basis-full xl:basis-1/2 text-left pt-10">
        <ul className="flex flex-col gap-3">
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
          <li className="flex flex-col">
            <span className="flex items-center gap-4">
              <span>siteUse</span>
              <span>:</span>
              <div className="flex gap-4 mt-2">
                {siteUse.map(({ id, url, icon, width, height }) => (
                  <a
                    key={id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-5"
                  >
                    <Image
                      src={icon}
                      width={width}
                      height={height}
                      alt={`${url} icon`}
                    />
                  </a>
                ))}
              </div>
            </span>
          </li>
          <li>FiezDev Portfolio @ 2022 - 2024</li>
        </ul>
      </div>
      <div className="basis-full xl:basis-1/2 pt-10">
        <ul className="flex flex-col pl-5 normal-case gap-3">
          {infoUse.map(({ id, icon, text, url }) => (
            <li className="flex flex-row gap-4" key={id}>
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

export default ContactInfo;
