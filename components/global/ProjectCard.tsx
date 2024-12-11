import { project } from '@/types/object';
import Image from 'next/image';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Badge } from '../ui/badge';

const ProjectCard = ({
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
}: project) => {
  console.log('projectName:', projectName);
  console.log('projectIntro:', projectIntro);
  return (
    <div className="seembg w-[90%] mb-5">
      <div
        className={`glass rounded-3xl p-4 h-auto flex flex-col lg:flex-row gap-4 ${
          pic.length <= 1 ? 'lg:h-[300px]' : 'lg:h-[284px] xl:h-[320px]'
        } `}
      >
        {pic.length <= 1 ? (
          <Image
            className="lg:w-[300px] xl:w-[400px] rounded-3xl"
            src={pic[0]}
            width={width}
            height={height}
            alt=""
          />
        ) : (
          <Carousel
            className="lg:w-[400px]"
            showArrows={false}
            showThumbs={false}
            showStatus={false}
            swipeable={true}
            stopOnHover={true}
            autoPlay={true}
            infiniteLoop={true}
            interval={3000}
          >
            {pic.map((item, index) => (
              <div key={index}>
                <Image
                  className="rounded-3xl"
                  src={item}
                  width={width}
                  height={height}
                  alt=""
                />
              </div>
            ))}
          </Carousel>
        )}

        <div className="p-5 pb-0 lg:pb-5 w-full lg:w-[calc(((100%-300px)/5)*2)] xl:w-[calc(((100%-400px)/5)*2)]">
          <h1>
            <span className="text-normal text-3xl font-[700] antialiased tracking-wide uppercase">
              Project
            </span>
            <br />
            <span className="text-white antialiased text-lg ">
              {projectName}
            </span>

            {projectName != projectIntro ? (
              <>
                <br />
                <span className="text-white antialiased text-lg ">
                  {projectIntro}
                </span>
              </>
            ) : null}
          </h1>
          <h1 className="mt-2">
            {stack.map((item, index) => (
              <Badge
                className="m-1 text-[9px] text-white bg-head focus:outline-none hover:bg-blue-600"
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

export default ProjectCard;
