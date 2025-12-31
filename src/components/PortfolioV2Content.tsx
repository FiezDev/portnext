import Head from 'next/head';
import Link from 'next/link';

const PortfolioV2Content = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Head>
        <title>Ittipol Portfolio V2</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      
      {/* Small V1 Link */}
      <div className="absolute top-4 right-4">
        <Link 
          href="/portfolio/v1" 
          className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1 border border-gray-600 rounded-full hover:border-gray-400"
        >
          View V1 →
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-6">
            Ittipol Portfolio
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            V2 - Coming Soon
          </p>
          <div className="text-gray-400">
            <p>This is the new portfolio main page.</p>
            <p className="mt-2">Content will be added here.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PortfolioV2Content;
