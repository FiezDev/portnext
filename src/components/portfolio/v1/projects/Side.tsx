import Heading from '@/components/global/Heading';
import SideProject from '@/components/global/SideProject';
import { SideProjects } from '@/mocks/projectMock';

const Sides = async () => {
  return (
    <section
      id="sides"
      className="container px-5 pt-16 md:pt-24 mx-auto flex flex-col items-center justify-center"
    >
      <Heading className="pb-16" text="PersonalProjects" />
      <article className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {SideProjects.map(
          (
            { projectName, projectDesc, stack, ghlink, weblink, apilink },
            index
          ) => (
            <SideProject
              key={`${index}-${projectName}`}
              projectName={projectName}
              projectDesc={projectDesc}
              stack={stack}
              ghlink={ghlink}
              weblink={weblink}
              apilink={apilink}
              className={
                index === SideProjects.length - 1 &&
                SideProjects.length % 2 !== 0
                  ? 'lg:col-span-2'
                  : ''
              }
            />
          )
        )}
      </article>
    </section>
  );
};

export default Sides;
