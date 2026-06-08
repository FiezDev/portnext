import { coreicon } from '@/constants/mapdata';
import Heading from '@/components/global/Heading';
import StackIcon from '@/components/global/StackIcon';

const Skills = () => {
  return (
    <section
      id="skills"
      className="container flex flex-col items-center justify-center mx-auto pt-16 md:pt-24 px-5 gap-10"
    >
      <Heading className="pb-8" text={'Core Skills'} />
      <article className="flex flex-wrap w-full">
        {coreicon.map(({ id, url, Icon, img, color, css, name }) => {
          return (
            <StackIcon
              key={id}
              url={url}
              Icon={Icon}
              img={img}
              color={color}
              className={css}
              name={name}
            />
          );
        })}
      </article>
    </section>
  );
};

export default Skills;
