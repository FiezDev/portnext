const defButton: ButtonProps = {
  text: 'Default',
  className:
    'flex-shrink-0 text-white bg-head border-0 py-2 px-8 focus:outline-none hover:bg-normal rounded text-lg mt-10 sm:mt-0',
};

type ButtonProps = {
  text: string;
  className?: string;
};

const NButton = ({ text, className }: ButtonProps) => {
  const cssProp = className
    ? defButton.className + ' ' + className
    : defButton.className;
  return <button className={`${cssProp}`}>{text}</button>;
};

export default NButton;
