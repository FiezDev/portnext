import {
  faCodepen,
  faGithub,
  faLine,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';
import {
  faAddressBook,
  faAddressCard,
  faGlobe,
  faHouseChimney,
  faLaptopFile,
  faPhone,
  faUserGear,
} from '@fortawesome/free-solid-svg-icons';
import type { IconType } from 'react-icons';
import {
  SiCss,
  SiFirebase,
  SiFramer,
  SiGreensock,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiThreedotjs,
  SiTypescript,
  SiVercel,
  SiGooglecloud,
} from 'react-icons/si';
import { ImgixImage } from './storage';

//contact
export const siteUse = [
  {
    id: 1,
    url: 'https://www.typescriptlang.org/',
    icon: ImgixImage.icon_typescript,
    width: 52,
    height: 52,
    css: '',
  },

  {
    id: 2,
    url: 'https://reactjs.org/',
    icon: ImgixImage.icon_react,
    width: 64,
    height: 64,
    css: '',
  },
  {
    id: 3,
    url: 'https://nextjs.org/',
    icon: ImgixImage.icon_nextjs,
    width: 64,
    height: 64,
    css: '',
  },
  {
    id: 4,
    url: 'https://tailwindcss.com/',
    icon: ImgixImage.icon_tailwindcss,
    width: 64,
    height: 64,
    css: '',
  },
  {
    id: 5,
    url: 'https://firebase.google.com/',
    icon: ImgixImage.icon_firebase,
    width: 64,
    height: 64,
    css: '',
  },
  {
    id: 6,
    url: 'https://vercel.com/',
    icon: ImgixImage.icon_vercel,
    width: 64,
    height: 64,
    css: '',
  },
];

export const codeUse = [
  {
    id: 1,
    url: 'https://github.com/FiezDev',
    icon: faGithub,
    text: 'GitHub',
  },

  {
    id: 2,
    url: 'https://codepen.io/fiezdev',
    icon: faCodepen,
    text: 'CodePen',
  },
];

export const infoUse = [
  {
    id: 1,
    icon: faLinkedin,
    text: 'Ittipol Vongapai',
    url: 'https://www.linkedin.com/in/fiezdev/',
  },
  {
    id: 3,
    icon: faPhone,
    text: '+66917210274',
    url: 'tel:+66917210274',
  },
  {
    id: 4,
    icon: faLine,
    text: 'gdrx1135',
    url: 'http://line.me/ti/p/~gdrx1135',
  },
  {
    id: 5,
    icon: faGlobe,
    text: 'fiez.dev/portfolio',
    url: 'https://www.fiez.dev/portfolio',
  },
];

//skills
export const icon = [
  {
    id: 1,
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
    icon: ImgixImage.icon_html,
    width: 64,
    height: 64,
    css: '',
  },
  {
    id: 2,
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
    icon: ImgixImage.icon_css,
    width: 64,
    height: 64,
    css: '',
  },
  {
    id: 3,
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    icon: ImgixImage.icon_javascript,
    width: 64,
    height: 64,
    css: '',
  },
  {
    id: 4,
    url: 'https://www.typescriptlang.org/',
    icon: ImgixImage.icon_typescript,
    width: 52,
    height: 52,
    css: '',
  },
  {
    id: 5,
    url: 'https://docs.microsoft.com/en-us/dotnet/csharp/',
    icon: ImgixImage.icon_csharp,
    width: 64,
    height: 64,
    css: '',
  },
  {
    id: 6,
    url: 'https://dart.dev/',
    icon: ImgixImage.icon_dart,
    width: 64,
    height: 64,
    css: '',
  },
  {
    id: 7,
    url: 'https://flutter.dev/',
    icon: ImgixImage.icon_flutter,
    width: 52,
    height: 52,
    css: '',
  },
  {
    id: 8,
    url: 'https://angular.io/',
    icon: ImgixImage.icon_angular,
    width: 64,
    height: 64,
    css: '',
  },
  {
    id: 9,
    url: 'https://vuejs.org/',
    icon: ImgixImage.icon_vue,
    width: 64,
    height: 64,
    css: '',
  },
  {
    id: 10,
    url: 'https://reactjs.org/',
    icon: ImgixImage.icon_react,
    width: 64,
    height: 64,
    css: '',
  },
  {
    id: 11,
    url: 'https://nextjs.org/',
    icon: ImgixImage.icon_nextjs,
    width: 64,
    height: 64,
    css: '',
  },
  {
    id: 12,
    url: 'https://tailwindcss.com/',
    icon: ImgixImage.icon_tailwindcss,
    width: 64,
    height: 64,
    css: '',
  },
  {
    id: 13,
    url: 'https://firebase.google.com/',
    icon: ImgixImage.icon_firebase,
    width: 64,
    height: 64,
    css: 'basis-1/2',
  },
  {
    id: 14,
    url: 'https://vercel.com/',
    icon: ImgixImage.icon_vercel,
    width: 64,
    height: 64,
    css: 'basis-1/2',
  },
];

export const coreicon: {
  id: number;
  name: string;
  url: string;
  Icon?: IconType;
  img?: string;
  color: string;
  css?: string;
}[] = [
  {
    id: 1,
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org/',
    Icon: SiTypescript,
    color: '#3178C6',
  },
  {
    id: 2,
    name: 'JavaScript',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    Icon: SiJavascript,
    color: '#F7DF1E',
  },
  {
    id: 3,
    name: 'Python',
    url: 'https://www.python.org/',
    Icon: SiPython,
    color: '#3776AB',
  },
  {
    id: 5,
    name: 'React',
    url: 'https://react.dev/',
    Icon: SiReact,
    color: '#61DAFB',
  },
  {
    id: 17,
    name: 'Zustand',
    url: 'https://zustand.docs.pmnd.rs/',
    img: '/icon/zustand.jpg',
    color: '#433E38',
  },
  {
    id: 6,
    name: 'Next.js',
    url: 'https://nextjs.org/',
    Icon: SiNextdotjs,
    color: '#000000',
  },
  {
    id: 7,
    name: 'Tailwind CSS',
    url: 'https://tailwindcss.com/',
    Icon: SiTailwindcss,
    color: '#06B6D4',
  },
  {
    id: 8,
    name: 'Three.js',
    url: 'https://threejs.org/',
    Icon: SiThreedotjs,
    color: '#000000',
  },
  {
    id: 9,
    name: 'GSAP',
    url: 'https://gsap.com/',
    Icon: SiGreensock,
    color: '#0AE448',
  },
  {
    id: 10,
    name: 'Framer Motion',
    url: 'https://www.framer.com/motion/',
    Icon: SiFramer,
    color: '#0055FF',
  },
  {
    id: 11,
    name: 'Node.js',
    url: 'https://nodejs.org/',
    Icon: SiNodedotjs,
    color: '#5FA04E',
  },
  {
    id: 12,
    name: 'Firebase',
    url: 'https://firebase.google.com/',
    Icon: SiFirebase,
    color: '#DD2C00',
  },
  {
    id: 13,
    name: 'Vercel',
    url: 'https://vercel.com/',
    Icon: SiVercel,
    color: '#000000',
  },
  {
    id: 14,
    name: 'Google Cloud',
    url: 'https://cloud.google.com/',
    Icon: SiGooglecloud,
    color: '#4285F4',
  },
  {
    id: 18,
    name: 'AWS',
    url: 'https://aws.amazon.com/',
    img: '/icon/aws.svg',
    color: '#FF9900',
  },
  {
    id: 16,
    name: 'HTML5',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
    Icon: SiHtml5,
    color: '#E34F26',
  },
  {
    id: 17,
    name: 'CSS3',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
    Icon: SiCss,
    color: '#1572B6',
  },
];

//sidenav
export const menu = [
  {
    id: 1,
    display: 'Contact',
    url: '#contact',
    picurl: faAddressBook,
  },
  {
    id: 2,
    display: 'Projects',
    url: '#project',
    picurl: faLaptopFile,
  },
  {
    id: 3,
    display: 'Skill',
    url: '#skills',
    picurl: faUserGear,
  },
  {
    id: 4,
    display: 'About',
    url: '#about',
    picurl: faAddressCard,
  },
  {
    id: 5,
    display: 'Home',
    url: '#main',
    picurl: faHouseChimney,
  },
];
//main
export const main = [
  {
    display: 'Contact',
    url: '#contact',
  },
  {
    display: 'Projects',
    url: '#project',
  },
  {
    display: 'Skill',
    url: '#skills',
  },
  {
    display: 'About',
    url: '#about',
  },
  {
    display: 'Home',
    url: '#main',
  },
];
