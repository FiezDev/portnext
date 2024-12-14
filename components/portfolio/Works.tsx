import { projectsData } from '@/mocks/projectMock';
import { project } from '@/types/object';
import axios from 'axios';
import Heading from '../global/Heading';
import ProjectCard from '../global/ProjectCard';

const Works = async () => {
  const fetchProjects = async (): Promise<project[]> => {
    try {
      const response = await axios.get(
        `https://nextbackend-fiezdev.vercel.app/api/fireStoreGetAll?colname=Projects`
      );

      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Unexpected response format:', response.data);
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      return [];
    }
  };

  const projects: project[] = await fetchProjects();

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
