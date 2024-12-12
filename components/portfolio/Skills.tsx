import { coreicon } from '@/constants/mapdata';
import Heading from '../global/Heading';
import StackIcon from '../global/StackIcon';

const Skills = () => {
  return (
    <section
      id="skills"
      className="container flex flex-col items-center justify-center mx-auto pt-16 md:pt-36 px-5 gap-10"
    >
      <Heading className="pb-8" text={'Core Skills'} />
      <article className="flex flex-wrap w-full">
        {coreicon.map(({ id, url, icon, width, height, css, tooltipText }) => {
          return (
            <StackIcon
              key={id}
              url={url}
              icon={icon}
              width={width}
              height={height}
              className={css}
              tooltipText={tooltipText}
            />
          );
        })}
      </article>
    </section>
  );
};

export default Skills;
