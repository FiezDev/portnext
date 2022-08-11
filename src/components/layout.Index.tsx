// import Head from 'next/head';
// import Nav from '@/components/portfolio/Sidenav';
// import Footer from '@/components/portfolio/Footer';

const name = 'Fiez';
export const siteTitle = 'Next.js Sample Website';

export interface IIndexLayout extends React.ComponentPropsWithoutRef<'div'> {
  // justify?: 'items-center' | 'items-start';
}

const IndexLayout: React.FC<IIndexLayout> = ({
  children,
  // justify = 'items-center',
  // ...divProps
}) => {
  return <div>{children}</div>;
  //   <Head>
  //   <title>NextJs Fullstack App Template</title>
  // </Head>
  // <div {...divProps} className={`min-h-screen flex flex-col ${justify}`}>
  //   <Header />
  //   <main className="px-5">{children}</main>
  //   <div className="m-auto" />
};

export default IndexLayout;
