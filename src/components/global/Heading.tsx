const def: HeadingProps = {
  text: 'Default',
  className:
    'text-normalH font-bold text-xl sm:text-3xl lg:text-4xl xl:text-5xl text-white block uppercase tracking-wider',
};

type HeadingProps = {
  text: string;
  className?: string;
};

const Heading = ({ text, className }: HeadingProps) => {
  const cssProp = className ? def.className + ' ' + className : def.className;
  const textProp = text ? text : def.text;
  return <h1 className={`${cssProp}`}>{textProp}</h1>;
};

export default Heading;
