import { useState } from 'react';

import Heading from '../global/Heading';
import ProjectCard from '../global/ProjectCard';

import { project } from '@/model/object';

type props = { props: { project: Array<project> } };

const Works = (props: props) => {
  const [project, SetProject] = useState(props.props.project);

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
