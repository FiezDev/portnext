import {
  faCodepen,
  faGithub,
  faLine,
} from '@fortawesome/free-brands-svg-icons';
import {
  faAddressBook,
  faAddressCard,
  faEnvelope,
  faGlobe,
  faHouseChimney,
  faLaptopFile,
  faPhone,
  faUserGear,
} from '@fortawesome/free-solid-svg-icons';
import { ImgixImage } from './storage';

//contact
export const siteuse = [
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

export const codeuse = [
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

export const infouse = [
  {
    id: 1,
    icon: faEnvelope,
    text: 'itti.task@gmail.com',
    url: 'mailto: itti.task@gmail.com',
  },

  {
    id: 2,
    icon: faPhone,
    text: '+66917210274',
    url: 'tel:+66917210274',
  },
  {
    id: 3,
    icon: faLine,
    text: 'gdrx1135',
    url: 'http://line.me/ti/p/~gdrx1135',
  },
  {
    id: 4,
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
//sidenav
export const menu = [
  {
    id: 1,
    display: 'Contact',
    url: '/portfolio/contact',
    picurl: faAddressBook,
  },
  {
    id: 2,
    display: 'Work',
    url: '/portfolio/works',
    picurl: faLaptopFile,
  },
  {
    id: 3,
    display: 'Skill',
    url: '/portfolio/skills',
    picurl: faUserGear,
  },
  {
    id: 4,
    display: 'About',
    url: '/portfolio/about',
    picurl: faAddressCard,
  },
  {
    id: 5,
    display: 'Home',
    url: '/portfolio/main',
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
    display: 'Work',
    url: '#works',
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
