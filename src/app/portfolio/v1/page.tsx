import { redirect } from 'next/navigation';

// The V1 portfolio is retired. Its components remain in the repo for history
// (see src/components/portfolio/v1/*), but the route now points visitors to V2.
const PortfolioV1 = () => {
  redirect('/portfolio');
};

export default PortfolioV1;
