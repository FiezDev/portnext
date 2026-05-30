import { ImgixImage } from '@/constants/storage';
import HoneycombMenu from './HoneycombMenu';

const menuItems = [
  {
    href: '/portfolio',
    image: ImgixImage.profilepic_NewMeEff,
    label: 'About',
    imagePosition: 'center top',
  },
  {
    href: '/work',
    image: ImgixImage.main_portfolio2,
    label: 'Work',
    imagePosition: 'center center',
  },
  {
    href: '/blog',
    image: ImgixImage.main_blog,
    label: 'Blog',
    imagePosition: 'center 35%',
  },
];

const MainContent = () => {
  return <HoneycombMenu items={menuItems} />;
};

export default MainContent;
