const def: HeadingProps = {
  text: 'Default',
  className:
    'textglow text-light font-bold text-4xl xl:text-5xl text-white block uppercase tracking-wider',
};

type HeadingProps = {
  text: string;
  className?: string;
};

const Heading = ({ text, className }: HeadingProps) => {
  const cssProp = className ? def.className + ' ' + className : def.className;
  const textProp = text ? text : def.text;
  return <header className={cssProp}>{textProp}</header>;
};

export default Heading;
