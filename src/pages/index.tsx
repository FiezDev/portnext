import Image from "next/image";
import Link from "next/link";

import Layout from "@/src/components/layoutPortfolio";
import mainP from "@/public/images/me.png";
import devBg from "@/public/images/devBg.jpg";
import workBg1 from "@/public/images/workBg1.jpg";
import workBg2 from "@/public/images/workBg2.jpg";
import workBg3 from "@/public/images/workBg3.jpg";

export default function home() {
  return (
    <Layout>
      <div className="absolute top-1/2 left-0 w-full -mt-[calc(100vw)/2] md:static md:mt-0 md:h-auto">
          <section className="container mx-auto h-[calc(100vw)] md:h-screen grid grid-cols-2 grid-rows-2 md:grid-rows-3">
            <div className="row-span-1 md:row-span-full left-0 top-0 overflow-clip md:flex md:items-center md:justify-center">
              <Image src={mainP} alt="" />
            </div>
            <>
              <Link href="/portfolio">
                <div className="opacity-30 hover:opacity-100 overflow-clip">
                  <Image src={devBg} alt="" />
                </div>
              </Link>
            </>
            <>
              <Link href="/admin">
                <div className="opacity-30  hover:opacity-100 overflow-clip">
                  <Image src={workBg1} alt="" />
                </div>
              </Link>
            </>
            <>
              <Link href="/blog">
                <div className="opacity-30  hover:opacity-100 overflow-clip">
                  <Image src={workBg2} alt="" />
                </div>
              </Link>
            </>
          </section>
        </div>

    </Layout>
  );
}
