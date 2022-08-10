import type { LayoutProps } from '../pageWithLayouts';
import Nav from '@/components/portfolio/Sidenav';
import Footer from '@/components/portfolio/Footer';

const name = 'Fiez';
export const siteTitle = 'Next.js Sample Website';

const PortfolioLayout: LayoutProps = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row flex-1">
        <Nav />
        <main className="flex-1">{children}</main>
        {/* <Footer/> */}
      </div>
    </div>
  );
};

export default PortfolioLayout;
