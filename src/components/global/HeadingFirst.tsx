const def: HeadingFirstProps = {
  text: 'Default',
  className:
    'last:hidden text-normalH hover:text-white font-bold  text-2xl sm:text-4xl lg:text-5xl xl:text-6xl text-white block uppercase tracking-wider',
};

type HeadingFirstProps = {
  text: string;
  className?: string;
};

const headingFirst = ({ text, className }: HeadingFirstProps) => {
  const cssProp = className ? def.className + ' ' + className : def.className;
  const textProp = text ? text : def.text;
  return <h1 className={`${cssProp}`}>{textProp}</h1>;
};

export default headingFirst;
