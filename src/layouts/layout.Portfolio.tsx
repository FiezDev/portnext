import Nav from '@/src/components/portfolio/Sidenav_portfolio';

export interface IPortfolioLayout
  extends React.ComponentPropsWithoutRef<'div'> {}

const PortfolioLayout: React.FC<IPortfolioLayout> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row flex-1">
        <Nav />
        <main className="flex-1 seembg">{children}</main>
        {/* <LiveChat /> */}
      </div>
    </div>
  );
};

export default PortfolioLayout;
