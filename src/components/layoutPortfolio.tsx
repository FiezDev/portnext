import Head from "next/head";
import Image from "next/image";
import styles from "./layout.module.css";
import utilStyles from "@/styles/utils.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import Nav from "@/components/portfolio/Sidenav";


const name = "Fiez";
export const siteTitle = "Next.js Sample Website";

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* <header className="bg-purple-200 sticky top-0 h-14 flex justify-center items-center font-semibold uppercase">
        Next.js sidebar menu
      </header> */}
      <div className="flex flex-col md:flex-row flex-1">
        <Nav/>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

// export default function Layout({
//   children,
//   home
// }: {
//   children: React.ReactNode
//   home?: boolean
// }) {
//   return (
//     <div className={styles.container}>
//       <Head>
//         <link rel="icon" href="/favicon.ico" />
//         <meta
//           name="description"
//           content="Learn how to build a personal website using Next.js"
//         />
//         <meta
//           property="og:image"
//           content={`https://og-image.vercel.app/${encodeURI(
//             siteTitle
//           )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
//         />
//         <meta name="og:title" content={siteTitle} />
//         <meta name="twitter:card" content="summary_large_image" />
//       </Head>

//       <header className={styles.header}>
//         {home ? (
//           <>
//             <Image
//               priority
//               src="/images/meabout.jpg"
//               className={utilStyles.borderCircle}
//               height={144}
//               width={144}
//               alt={name}
//             />
//             <h1 className={`text-black ${utilStyles.heading2Xl}`}>{name}</h1>
//           </>
//         ) : (
//           <>
//             <Link href="/">
//               <a>
//                 <Image
//                   priority
//                   src="/images/meabout.jpg"
//                   className={utilStyles.borderCircle}
//                   height={108}
//                   width={108}
//                   alt={name}
//                 />
//               </a>
//             </Link>
//             <h2 className={utilStyles.headingLg}>
//               <Link href="/">
//                 <a className={utilStyles.colorInherit}>{name}</a>
//               </Link>
//             </h2>
//           </>
//         )}
//       </header>
//       <main>{children}</main>
//       {!home && (
//         <div className={styles.backToHome}>
//           <Link href="/">
//             <a>← Back to home</a>
//           </Link>
//         </div>
//       )}
//     </div>
//   )
// }
