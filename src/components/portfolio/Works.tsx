import { useEffect, useState } from 'react';

import Heading from '../global/Heading';
import ProjectCard from '../global/ProjectCard';

import axios from 'axios';

const Works: React.FC = () => {
  const [project, SetProject] = useState([]);

  useEffect(() => {
    const colname = 'Projects';
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BACKURL}api/fireStoreGetAll?colname=${colname}`
      )
      .then((res) => SetProject(res.data));
  }, []);

  return (
    <section
      id="works"
      className="container px-5 py-24 mx-auto flex flex-col items-center justify-center"
    >
      <Heading className={'pb-16'} text={'Works'} />
      <article className="flex flex-wrap -m-4 items-center justify-evenly">
        {project.map(
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
