import { main } from '@/src/constants/mapdata';
import Introduction from './main/Introduction';
import Navigation from './main/Navigation';
import ProfileImage from './main/Profile_image';

const Main = () => {
  return (
    <section
      id="main"
      className="container mx-auto max-w-[1140px] p-0 px-5 grid grid-cols-12 gap-0 md:gap-8 items-center justify-center"
    >
      <Navigation items={main} />
      <ProfileImage />
      <Introduction />
    </section>
  );
};

export default Main;
