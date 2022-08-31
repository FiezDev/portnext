import { ImgixImage } from '@/model/storage';
import Heading from '../global/Heading';
import StackIcon from '../global/StackIcon';

const Skills: React.FC = () => {
  const icon = [
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
  return (
    <section className="container flex flex-col items-center justify-center mx-auto pt-16 md:pt-36 px-5 gap-10">
      <Heading className={''} text={'Skills'} />
      <div className="flex flex-wrap w-full">
        {icon.map(({ id, url, icon, width, height, css }) => {
          return (
            <StackIcon
              key={id}
              url={url}
              icon={icon}
              width={width}
              height={height}
              className={css}
            />
          );
        })}
      </div>
    </section>
  );
};

export default Skills;
