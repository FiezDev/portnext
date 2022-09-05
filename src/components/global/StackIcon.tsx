import Image from 'next/image';

type stackIconProps = {
  url: string;
  icon: string;
  width: number;
  height: number;
  className: string;
};

const def = {
  className: 'basis-1/4 md:basis-[14%] flex items-center justify-around pb-4 ',
};

const StackIcon = ({ url, icon, width, height, className }: stackIconProps) => {
  const cssProp = className ? `${def.className}${className}` : def.className;

  return (
    <a className={cssProp} href={url} target="_blank" rel="noopener noreferrer">
      <Image src={icon} alt="" width={width} height={height} />
    </a>
  );
};

export default StackIcon;
