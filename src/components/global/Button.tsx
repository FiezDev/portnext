const def: ButtonProps = {
  text: 'Default',
  className:
    'flex-shrink-0 text-white bg-head border-0 py-2 px-8 focus:outline-none hover:bg-normal rounded text-lg',
};

type ButtonProps = {
  text: string;
  className?: string;
};

const Button = ({ text, className }: ButtonProps) => {
  const cssProp = className ? def.className + ' ' + className : def.className;
  const textProp = text ? text : def.text;
  return <button className={`${cssProp}`}>{textProp}</button>;
};

export default Button;
