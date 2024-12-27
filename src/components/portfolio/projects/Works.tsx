import Heading from '@/components/global/Heading';
import { WorkProjects } from '@/mocks/projectMock';
import { useGetProject } from '@/services/project';
import WorkProject from '@/src/components/global/WorkProject';

const Works = async () => {
  const fetchedProjects = await useGetProject('Projects', '');

  const projects = fetchedProjects || WorkProjects;

  const sortedData = [...projects].sort((a, b) => b.projectID - a.projectID);

  return (
    <section
      id="works"
      className="container px-5 pt-16 md:pt-24 mx-auto flex flex-col items-center justify-center"
    >
      <Heading className="pb-16" text="Projects" />
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
            <WorkProject
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
