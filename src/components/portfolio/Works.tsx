import Heading from '@/components/global/Heading';
import ProjectCard from '@/components/global/ProjectCard';
import { projectsData } from '@/mocks/projectMock';
import { useGetProject } from '@/services/project';

const Works = async () => {
  const fetchedProjects = await useGetProject('Projects', '');

  const projects = fetchedProjects || projectsData;

  const sortedData = [...projects].sort((a, b) => b.projectID - a.projectID);

  return (
    <section
      id="works"
      className="container px-5 pt-16 md:pt-24 mx-auto flex flex-col items-center justify-center"
    >
      <Heading className="pb-16" text="Works" />
      <article className="flex flex-wrap -m-4 items-center justify-evenly">
        {sortedData.map(
          ({
            projectID,
            projectType,
            projectName,
            projectIntro,
            projectDesc,
            projectPic: {
              picurl: { height, pic, width },
            },
            createDate,
            activeFlag,
            status,
            stack,
          }) => (
            <ProjectCard
              key={projectID}
              projectID={projectID}
              projectType={projectType}
              projectName={projectName}
              projectIntro={projectIntro}
              projectDesc={projectDesc}
              projectPic={{
                picurl: { height, pic, width },
              }}
              createDate={createDate}
              activeFlag={activeFlag}
              status={status}
              stack={stack}
            />
          )
        )}
      </article>
    </section>
  );
};

export default Works;
