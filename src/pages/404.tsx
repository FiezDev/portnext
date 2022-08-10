import { ENUM_EROR_CODE } from '@/model/enum';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type Props = {};

const e404 = () => {
  return (
    <>
      <section className="container mx-auto flex flex-col items-center justify-center h-screen text-2xl md:text-5xl gap-4">
        <Image
          src={`https://http.cat/${ENUM_EROR_CODE.NotFound}`}
          alt=""
          width={750}
          height={600}
        />
        <span>Someone is Lost</span>
        <span className="text-head">
          <Link href="/">Go Back</Link>
        </span>
      </section>
    </>
  );
};

export default e404;
