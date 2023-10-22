import Image from 'next/image';

type StackIconProps = {
  url: string;
  icon: string;
  width: number;
  height: number;
  className: string;
  tooltipText: string;
};

const def = {
  className:
    'group basis-1/4 md:basis-[14%] flex items-center justify-around pb-4 relative',
};

const StackIcon = ({
  url,
  icon,
  width,
  height,
  className,
  tooltipText,
}: StackIconProps) => {
  const cssProp = className ? `${def.className} ${className}` : def.className;

  return (
    <a className={cssProp} href={url} target="_blank" rel="noopener noreferrer">
      <div className="relative group-hover:rotate-3 transform transition-transform duration-300 ease-in-out hover:duration-1000">
        <Image src={icon} alt="" width={width} height={height} />
      </div>
      <span className="absolute left-1/2 bottom-0 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition duration-300 text-white z-10 whitespace-nowrap">
        {tooltipText}
      </span>
    </a>
  );
};

export default StackIcon;
