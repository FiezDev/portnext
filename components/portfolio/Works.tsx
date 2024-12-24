import { projectsData } from '@/mocks/projectMock';
import { apiClient } from '@/services/baseApi';
import { ApiResponse } from '@/types/common';
import { project } from '@/types/object';
import Heading from '../global/Heading';
import ProjectCard from '../global/ProjectCard';

const Works = async () => {
  const response = await apiClient.get<ApiResponse<project[]>>('v1/project', {
    params: {
      collection: 'Projects',
    },
  });

  const projects = response.data.status === 200 ? response.data.data : [];

  const sortedData =
    projects.length > 0
      ? [...projects].sort((a, b) => b.projectID - a.projectID)
      : [...projectsData].sort((a, b) => b.projectID - a.projectID);

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
            projectFullName,
            projectIntro,
            projectDesc,
            projectPic: {
              picurl: { height, pic, width },
            },
            createDate,
            updateDate,
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
