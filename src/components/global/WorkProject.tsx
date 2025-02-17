import EmblaCarousel from '@/components/global/EmbiaCarousel/Index';
import { Badge } from '@/components/ui/badge';
import { WorkProjectObj } from '@/src/types/object';

const WorkProject = ({
  projectName,
  projectIntro,
  projectDesc,
  projectPic: {
    picurl: { pic },
  },
  stack,
}: WorkProjectObj) => {
  return (
    <div className="seembg w-[90%] mb-5">
      <div className="glass rounded-3xl p-4 h-auto flex flex-col lg:flex-row gap-4 ">
        <div className="flex items-center justify-center">
          <EmblaCarousel items={pic} options={{ loop: true }} />
        </div>
        <div className="p-5 pb-0 lg:pb-5 w-full lg:w-[calc(((100%-300px)/5)*2)] xl:w-[calc(((100%-400px)/5)*2)]">
          <div className="text-normal text-3xl font-[700] antialiased tracking-wide uppercase pb-4">
            Project
          </div>
          <div className="text-white antialiased text-lg ">{projectName}</div>
          {projectName != projectIntro ? (
            <div className="text-white antialiased text-lg ">
              {projectIntro}
            </div>
          ) : null}
          <h1 className="pt-4">
            {stack.map((item, index) => (
              <Badge
                className="m-1 text-sm font-semibold tracking-wider text-white bg-head focus:outline-none hover:bg-blue-600"
                key={index}
                variant="default"
              >
                {item}
              </Badge>
            ))}
          </h1>
        </div>
        <div className="p-5 pt-0 lg:pt-5 w-full lg:w-[calc(((100%-300px)/5)*3)] xl:w-[calc(((100%-400px)/5)*3)] text-lg">
          <ul>
            {projectDesc.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorkProject;
