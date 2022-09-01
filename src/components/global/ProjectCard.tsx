import { project } from '@/model/object';
import { Chip } from '@material-tailwind/react';
import Image from 'next/image';

const ProjectCard = ({
  projectID,
  projectType,
  projectName,
  projectFullName,
  projectIntro,
  projectDesc,
  projectPic: { picurl },
  createDate,
  updateDate,
  activeFlag,
  status,
  stack,
}: project) => {
  return (
    <div className="glass p-4 w-[90%] h-auto lg:h-[300px] mb-5 flex flex-col lg:flex-row gap-4">
      <Image
        className="lg:w-[300px] xl:w-[400px] rounded-3xl"
        src={picurl.pic}
        width={picurl.width}
        height={picurl.height}
        alt=""
      />
      <div className="p-5 w-full lg:w-[calc(((100%-300px)/5)*2)] xl:w-[calc(((100%-400px)/5)*2)]">
        <h1>
          <span className="text-normal text-3xl font-[700] antialiased tracking-wide uppercase">
            Project
          </span>
          <br />
          <span className="text-white antialiased text-lg ">{projectName}</span>
        </h1>
        <h1 className="my-5">
          {stack.map((item, index) => (
            <Chip className="m-1" key={index} value={item} variant="filled" />
          ))}
        </h1>
      </div>
      <div className="p-5 w-full lg:w-[calc(((100%-300px)/5)*3)] xl:w-[calc(((100%-400px)/5)*3)] text-lg">
        {' '}
        {projectDesc}
      </div>
    </div>
  );
};

export default ProjectCard;
