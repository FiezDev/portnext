'use client';

import { projectsData } from '@/mocks/projectMock';
import { project } from '@/types/object';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Heading from '../global/Heading';
import ProjectCard from '../global/ProjectCard';

const Works = () => {
  const {
    data: projects,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<project[], Error>({
    queryKey: ['get-projects'],
    queryFn: async () => {
      const response = await axios.get(
        `https://nextbackend-fiezdev.vercel.app/api/fireStoreGetAll?colname=Projects`
      );
      return response.data.reverse();
    },
  });

  const sortedData =
    projects ?? [...projectsData].sort((a, b) => b.projectID - a.projectID);

  // if (isLoading) {
  //   return (
  //     <section
  //       id="works"
  //       className="container px-5 py-24 mx-auto flex flex-col items-center justify-center"
  //     >
  //       <Heading className="pb-16" text="Works" />
  //       <p>Loading projects...</p>
  //     </section>
  //   );
  // }

  // if (isError) {
  //   return (
  //     <section
  //       id="works"
  //       className="container px-5 py-24 mx-auto flex flex-col items-center justify-center"
  //     >
  //       <Heading className="pb-16" text="Works" />
  //       <p>Error fetching projects: {error.message}</p>
  //       <button
  //         onClick={() => refetch()}
  //         className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded"
  //       >
  //         Retry
  //       </button>
  //     </section>
  //   );
  // }

  // if (!projects || projects.length === 0) {
  //   return (
  //     <section
  //       id="works"
  //       className="container px-5 py-24 mx-auto flex flex-col items-center justify-center"
  //     >
  //       <Heading className="pb-16" text="Works" />
  //       <p>No projects available at the moment.</p>
  //     </section>
  //   );
  // }

  return (
    <section
      id="works"
      className="container px-5 py-24 mx-auto flex flex-col items-center justify-center"
    >
      <Heading className="pb-16" text="Works" />
      <article className="flex flex-wrap -m-4 items-center justify-evenly">
        {sortedData?.map(
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
