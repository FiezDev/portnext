import Nav from '@/components/portfolio/Sidenav';
import { ReactNode } from 'react';
import LiveChat from '../components/global/Livechat';

type PortfolioLayoutProps = {
  children?: ReactNode;
};

const PortfolioLayout = ({ children }: PortfolioLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row flex-1">
        <Nav />
        <main className="flex-1 seembg">{children}</main>
        <LiveChat />
      </div>
    </div>
  );
};

export default PortfolioLayout;
