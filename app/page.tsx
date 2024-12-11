import MainContent from '@/components/Main.Index';
import Navigation from '@/components/navigation';
import { Toaster } from '@/components/ui/toaster';

const Home = () => {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
          <MainContent />
        </div>
      </main>
      <Toaster />
    </>
  );
};

export default Home;
