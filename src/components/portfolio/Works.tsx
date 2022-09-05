import { useEffect, useState } from 'react';

import Heading from '../global/Heading';
import ProjectCard from '../global/ProjectCard';

const Works: React.FC = () => {
  const [project, SetProject] = useState([]);

  useEffect(() => {
    fetch('api/fireStoreGetAll')
      .then((res) => res.json())
      .then((data) => {
        SetProject(data);
      });
  }, []);

  return (
    <div className="container px-5 py-24 mx-auto flex flex-col items-center justify-center">
      <Heading className={'pb-16'} text={'Works'} />
      <div className="flex flex-wrap -m-4 items-center justify-evenly">
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
      </div>
    </div>
  );
};

export default Works;
