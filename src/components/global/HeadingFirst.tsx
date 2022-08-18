const def: HeadingFirstProps = {
  text: 'Default',
  className:
    'last:hidden first-letter:text-normalH hover:text-white font-bold text-sm sm:text-2xl lg:text-3xl xl:text-4xl first-letter:text-2xl sm:first-letter:text-4xl lg:first-letter:text-5xl xl:first-letter:text-6xl text-white block uppercase tracking-wider',
};

type HeadingFirstProps = {
  text: string;
  className?: string;
};

const headingFirst = ({ text, className }: HeadingFirstProps) => {
  const cssProp = className ? def.className + ' ' + className : def.className;
  return <h1 className={`${cssProp}`}>{text}</h1>;
};

export default headingFirst;
